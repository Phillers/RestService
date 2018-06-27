import tornado.ioloop
import tornado.web
import MySQLdb
import json


class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.write('<a href="games">games</a><a href ="users">users</a>')


class GamesHandler(tornado.web.RequestHandler):
    db = MySQLdb.connect("localhost", "phillers", "", "rest")
    cursor = db.cursor()

    def get(self):
        self.cursor.execute("select * from games")
        desc = [x[0] for x in self.cursor.description]
        d = []
        for row in self.cursor.fetchall():
            rowd = dict(zip(desc, row))
            id = rowd.pop("id")
            rowd.pop("etag")
            rowd["link"] = "/games/" + str(id)
            d.append(rowd)
            print(rowd)
        self.write({"list": d})


class GameHandler(tornado.web.RequestHandler):
    db = MySQLdb.connect("localhost", "phillers", "", "rest")
    cursor = db.cursor()

    def get(self, id):
        if self.cursor.execute("select * from games where id =%s", id) < 1:
            self.send_error(404)
        desc = [x[0] for x in self.cursor.description]
        row = self.cursor.fetchone()
        d = dict(zip(desc, row))
        etag =d.pop("etag")
        self.set_header("ETag",etag)
        self.write(d)


class UsersHandler(tornado.web.RequestHandler):
    db = MySQLdb.connect("localhost", "phillers", "", "rest")
    cursor = db.cursor()

    def get(self):
        self.cursor.execute("select * from users")
        desc = [x[0] for x in self.cursor.description]
        d = []
        for row in self.cursor.fetchall():
            rowd = dict(zip(desc, row))
            id = rowd.pop("id")
            rowd.pop("etag")
            rowd["link"] = "/users/" + str(id)
            d.append(rowd)
            print(rowd)
        self.write({"list": d})


class UserHandler(tornado.web.RequestHandler):
    db = MySQLdb.connect("localhost", "phillers", "", "rest")
    cursor = db.cursor()

    def get(self, id):
        if self.cursor.execute("select * from users where id =%s", id) < 1:
            self.send_error(404)
        desc = [x[0] for x in self.cursor.description]
        row = self.cursor.fetchone()
        d = dict(zip(desc, row))
        etag = d.pop("etag")
        self.set_header("ETag", etag)
        self.write(d)


class GameCopyHandler(tornado.web.RequestHandler):
    db = MySQLdb.connect("localhost", "phillers", "", "rest")
    cursor = db.cursor()

    def get(self, id):
        self.cursor.execute("select * from copies where game_id=%s", id)
        desc = [x[0] for x in self.cursor.description]
        d = []
        print(id)
        for row in self.cursor.fetchall():
            rowd = dict(zip(desc, row))
            id2 = rowd.pop("id")
            rowd.pop("game_id")
            self.cursor.execute("select name from users where id=%s", [rowd["owner"]])
            rowd["owner_name"]=self.cursor.fetchone()[0]
            rowd["link"] = "/games/" + str(id) +"/copies/"+str(id2)
            d.append(rowd)
            print(rowd)
        self.write({"list": d})


class UserCopyHandler(tornado.web.RequestHandler):
    db = MySQLdb.connect("localhost", "phillers", "", "rest")
    cursor = db.cursor()

    def get(self, id):
        self.cursor.execute("select * from copies where owner=%s", id)
        desc = [x[0] for x in self.cursor.description]
        d = []
        for row in self.cursor.fetchall():
            rowd = dict(zip(desc, row))
            id2 = rowd.pop("id")
            rowd.pop("owner")
            self.cursor.execute("select title from games where id=%s", [rowd["game_id"]])
            rowd["game_name"]=self.cursor.fetchone()[0]
            rowd["link"] = "/users/" + str(id)+"/copies/"+str(id2)
            d.append(rowd)
            print(rowd)
        self.write({"list": d})

class CopyHandler(tornado.web.RequestHandler):
    db = MySQLdb.connect("localhost", "phillers", "", "rest")
    cursor = db.cursor()

    def get(self, id):
        if self.cursor.execute("select * from copies where id =%s", id) < 1:
            self.send_error(404)
        desc = [x[0] for x in self.cursor.description]
        row = self.cursor.fetchone()
        d = dict(zip(desc, row))
        d.pop("id")
        self.cursor.execute("select title from games where id=%s", [d["game_id"]])
        d["game"]=self.cursor.fetchone()[0]
        self.cursor.execute("select name from users where id=%s", [d["owner"]])
        d["owner"] = self.cursor.fetchone()[0]
        self.write(d)


class RentsHandler(tornado.web.RequestHandler):
    db = MySQLdb.connect("localhost", "phillers", "", "rest")
    cursor = db.cursor()

    def get(self):
        self.cursor.execute("select * from rents")
        desc = [x[0] for x in self.cursor.description]
        d = []
        for row in self.cursor.fetchall():
            rowd = dict(zip(desc, row))
            id = rowd.pop("id")
            rowd["link"] = "/rents/" + str(id)
            rowd["date1"] = str(rowd["date1"])#.isoformat()
            rowd["date2"] = str(rowd["date2"])#.isoformat()
            d.append(rowd)
            print(rowd)
        self.write({"list": d})


class RentHandler(tornado.web.RequestHandler):
    db = MySQLdb.connect("localhost", "phillers", "", "rest")
    cursor = db.cursor()

    def get(self, id):
        if self.cursor.execute("select * from rents where id =%s", id) < 1:
            self.send_error(404)
        desc = [x[0] for x in self.cursor.description]
        row = self.cursor.fetchone()
        d = dict(zip(desc, row))
        d.pop("id")
        d["date1"] = str(d["date1"])  # .isoformat()
        d["date2"] = str(d["date2"])  # .isoformat()
        self.cursor.execute("select game_id, owner from copies where id=%s", [d["copy_id"]])
        [game, user] = self.cursor.fetchone()
        self.cursor.execute("select title from games where id=%s", [game])
        d["game"]=self.cursor.fetchone()[0]
        self.cursor.execute("select name from users where id=%s", [user])
        d["owner"] = self.cursor.fetchone()[0]
        self.cursor.execute("select name from users where id=%s", [d["holder_id"]])
        d["holder_name"] = self.cursor.fetchone()[0]
        self.write(d)

class UserRentsHandler(tornado.web.RequestHandler):
    db = MySQLdb.connect("localhost", "phillers", "", "rest")
    cursor = db.cursor()

    def get(self, id):
        self.cursor.execute("select * from rents where owner=%s or holder=%s", [id,id])
        desc = [x[0] for x in self.cursor.description]
        d = []
        for row in self.cursor.fetchall():
            rowd = dict(zip(desc, row))
            id2 = rowd.pop("id")
            rowd.pop("owner")
            self.cursor.execute("select title from games where id=%s", [rowd["game_id"]])
            rowd["game_name"]=self.cursor.fetchone()[0]
            rowd["link"] = "/rents/" +str(id2)
            d.append(rowd)
            print(rowd)
        self.write({"list": d})

if __name__ == "__main__":
    application = tornado.web.Application([
        ("/", MainHandler),
        ("/games/?", GamesHandler),
        ("/games/([0-9]+)/?", GameHandler),
        ("/games/([0-9]+)/copies/?", GameCopyHandler),
        ("/games/[0-9]+/copies/([0-9]+)/?", CopyHandler),
        ("/rents/?", RentsHandler),
        ("/rents/([0-9]+)/?", RentHandler),
        ("/users/?", UsersHandler),
        ("/users/([0-9]+)/?", UserHandler),
        ("/users/([0-9]+)/copies/?", UserCopyHandler),
        ("/users/[0-9]+/copies/([0-9]+)/?", CopyHandler),
        ("/users/([0-9]+)/rents/?", UserRentsHandler),
    ])
    application.listen(8888)
    tornado.ioloop.IOLoop.instance().start()
