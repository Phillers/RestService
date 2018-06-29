import tornado.ioloop
import tornado.web
import MySQLdb
import json
import datetime


class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.write('<a href="games">games</a><a href ="users">users</a>')


class GamesHandler(tornado.web.RequestHandler):
    db = MySQLdb.connect("localhost", "phillers", "", "rest", charset="utf8", use_unicode=True)
    cursor = db.cursor()

    def get(self):
        self.db.commit()
        self.cursor.execute("select * from games")
        desc = [x[0] for x in self.cursor.description]
        d = []
        for row in self.cursor.fetchall():
            rowd = dict(zip(desc, row))
            id = rowd["id"]
            rowd.pop("etag")
            rowd["link"] = "/games/" + str(id)
            d.append(rowd)
            print(rowd)
        self.set_header("Access-Control-Allow-Origin", "*")
        self.write({"list": d})

    def post(self):
        try:
            data = json.loads(self.request.body.decode("utf-8"))
        except:
            self.add_header("Accept", "application/json")
            self.set_status(400)
            return
        if "title" not in data:
            self.send_error(400)
            return
        if "author" not in data:
            data["author"] = None
        self.cursor.execute("insert into games(title, author) values(%s,%s)", [data["title"], data["author"]])
        self.db.commit()
        self.cursor.execute("select max(id) from games where title=%s", [data["title"]])
        r = self.cursor.fetchone()
        self.add_header("Location", "/games/" + str(r[0]))
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_status(201)


class GameHandler(tornado.web.RequestHandler):
    db = MySQLdb.connect("localhost", "phillers", "", "rest", charset="utf8", use_unicode=True)
    cursor = db.cursor()

    def get(self, id):
        if self.cursor.execute("select * from games where id =%s", [id]) < 1:
            self.send_error(404)
        desc = [x[0] for x in self.cursor.description]
        row = self.cursor.fetchone()
        d = dict(zip(desc, row))
        etag = d.pop("etag")
        self.set_header("ETag", etag)
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Expose-Headers", "ETag")
        self.write(d)

    def put(self, id):
        self.set_header("Access-Control-Allow-Origin", "*")
        try:
            data = json.loads(self.request.body.decode("utf-8"))
        except Exception as e:
            print(e)
            self.add_header("Accept", "application/json")
            self.set_status(400)
            return
        if self.cursor.execute("select * from games where id =%s", [id]) < 1:
            self.send_error(404)
        desc = [x[0] for x in self.cursor.description]
        row = self.cursor.fetchone()
        d = dict(zip(desc, row))
        if not "ETag" in self.request.headers or int(self.request.headers["ETag"]) != d["etag"]:
            self.set_header("Etag", d["etag"])
            self.set_status(428)
            return
        if "author" not in data:
            data["author"] = d["author"]
        if "title" not in data:
            data["title"] = d["title"]
        data["etag"] = d["etag"] + 1
        self.cursor.execute("update games set title=%s,  author=%s, etag=%s where id=%s",
                            [data["title"], data["author"], data["etag"], id])
        self.db.commit()
        self.add_header("ETag", data["etag"])

    def options(self, id):
        print(self.request)
        self.set_header("Access-Control-Allow-Origin", "*")
        self.set_header("Access-Control-Allow-Headers", "etag")
        self.set_header("Access-Control-Allow-Methods", "PUT, DELETE")

    def delete(self, id):
        self.set_header("Access-Control-Allow-Origin", "*")
        try:
            self.cursor.execute("delete from games where id=%s", [id])
            self.db.commit()
        except Exception as e:
            self.set_status(403)
            self.write("Probably existing copies")


class UsersHandler(tornado.web.RequestHandler):
    db = MySQLdb.connect("localhost", "phillers", "", "rest", charset="utf8", use_unicode=True)
    cursor = db.cursor()

    def get(self):
        self.db.commit()
        self.cursor.execute("select * from users")
        desc = [x[0] for x in self.cursor.description]
        d = []
        for row in self.cursor.fetchall():
            rowd = dict(zip(desc, row))
            id = rowd["id"]
            rowd.pop("etag")
            rowd["link"] = "/users/" + str(id)
            d.append(rowd)
            print(rowd)
        self.write({"list": d})

    def post(self):
        try:
            data = json.loads(self.request.body.decode("utf-8"))
        except:
            self.add_header("Accept", "application/json")
            self.set_status(400)
            return
        print(data)
        if "name" not in data:
            self.send_error(400)
            return
        self.cursor.execute("insert into users(name) values(%s)", [data["name"]])
        self.db.commit()
        self.cursor.execute("select max(id) from users where name=%s", [data["name"]])
        r = self.cursor.fetchone()
        self.add_header("Location", "/users/" + str(r[0]))
        self.set_status(201)


class UserHandler(tornado.web.RequestHandler):
    db = MySQLdb.connect("localhost", "phillers", "", "rest", charset="utf8", use_unicode=True)
    cursor = db.cursor()

    def get(self, id):
        if self.cursor.execute("select * from users where id =%s", [id]) < 1:
            self.send_error(404)
        desc = [x[0] for x in self.cursor.description]
        row = self.cursor.fetchone()
        d = dict(zip(desc, row))
        etag = d.pop("etag")
        self.set_header("ETag", etag)
        self.write(d)

    def put(self, id):
        try:
            data = json.loads(self.request.body.decode("utf-8"))
        except:
            self.add_header("Accept", "application/json")
            self.set_status(400)
            return
        if self.cursor.execute("select * from users where id =%s", [id]) < 1:
            self.send_error(404)
        desc = [x[0] for x in self.cursor.description]
        row = self.cursor.fetchone()
        d = dict(zip(desc, row))
        if not "ETag" in self.request.headers or int(self.request.headers["ETag"]) != d["etag"]:
            self.set_header("Etag", d["etag"])
            self.set_status(428)
            return
        if "name" not in data:
            data["name"] = d["name"]
        data["etag"] = d["etag"] + 1
        self.cursor.execute("update users set name=%s, etag=%s where id=%s", [data["name"], data["etag"], id])
        self.db.commit()
        self.add_header("ETag", data["etag"])

    def delete(self, id):
        try:
            self.cursor.execute("delete from users where id=%s", [id])
            self.db.commit()
        except Exception as e:
            self.set_status(403)
            self.write("Probably existing copies")


class GameCopyHandler(tornado.web.RequestHandler):
    db = MySQLdb.connect("localhost", "phillers", "", "rest", charset="utf8", use_unicode=True)
    cursor = db.cursor()

    def get(self, id):
        self.db.commit()
        print(self.cursor.execute("select * from copies where game_id=%s", [id]))
        desc = [x[0] for x in self.cursor.description]
        d = []
        print(id)

        for row in self.cursor.fetchall():
            rowd = dict(zip(desc, row))
            id2 = rowd["id"]
            rowd.pop("game_id")
            self.cursor.execute("select name from users where id=%s", [rowd["owner"]])
            rowd["owner_name"] = self.cursor.fetchone()[0]
            rowd["link"] = "/games/" + str(id) + "/copies/" + str(id2)
            d.append(rowd)
            print(rowd)
        self.set_header("Access-Control-Allow-Origin", "*")
        self.write({"list": d})

    def post(self, id):
        try:
            data = json.loads(self.request.body.decode("utf-8"))
        except:
            self.add_header("Accept", "application/json")
            self.set_status(400)
            return
        if "owner" not in data:
            self.send_error(400)
            return
        try:
            self.cursor.execute("insert into copies(game_id, owner) values(%s, %s)", [id, data["owner"]])
            self.db.commit()
        except Exception as e:
            self.set_status(403)
            self.write("Probably wrong owner")
            return
        self.cursor.execute("select max(id) from copies where game_id=%s", [id])
        r = self.cursor.fetchone()
        self.add_header("Location", "/games/" + str(id) + "/copies/" + str(r[0]))
        self.set_status(201)


class UserCopyHandler(tornado.web.RequestHandler):
    db = MySQLdb.connect("localhost", "phillers", "", "rest", charset="utf8", use_unicode=True)
    cursor = db.cursor()

    def get(self, id):
        self.db.commit()
        self.cursor.execute("select * from copies where owner=%s", [id])
        desc = [x[0] for x in self.cursor.description]
        d = []
        for row in self.cursor.fetchall():
            rowd = dict(zip(desc, row))
            id2 = rowd["id"]
            rowd.pop("owner")
            self.cursor.execute("select title from games where id=%s", [rowd["game_id"]])
            rowd["game_name"] = self.cursor.fetchone()[0]
            rowd["link"] = "/users/" + str(id) + "/copies/" + str(id2)
            d.append(rowd)
            print(rowd)
        self.write({"list": d})

    def post(self, id):
        try:
            data = json.loads(self.request.body.decode("utf-8"))
        except:
            self.add_header("Accept", "application/json")
            self.set_status(400)
            return
        if "game_id" not in data:
            self.send_error(400)
            return
        try:
            self.cursor.execute("insert into copies(game_id, owner) values(%s, %s)", [data["game_id"], id])
            self.db.commit()
        except Exception as e:
            self.set_status(403)
            self.write("Probably wrong game")
            return
        self.cursor.execute("select max(id) from copies where owner=%s", [id])
        r = self.cursor.fetchone()
        self.add_header("Location", "/users/" + str(id) + "/copies/" + str(r[0]))
        self.set_status(201)


class CopyHandler(tornado.web.RequestHandler):
    db = MySQLdb.connect("localhost", "phillers", "", "rest", charset="utf8", use_unicode=True)
    cursor = db.cursor()

    def get(self, id):
        if self.cursor.execute("select * from copies where id =%s", [id]) < 1:
            self.send_error(404)
            return
        desc = [x[0] for x in self.cursor.description]
        row = self.cursor.fetchone()
        print(row)
        d = dict(zip(desc, row))
        d["id"]
        self.cursor.execute("select title from games where id=%s", [d["game_id"]])
        d["game"] = self.cursor.fetchone()[0]
        self.cursor.execute("select name from users where id=%s", [d["owner"]])
        d["owner"] = self.cursor.fetchone()[0]
        self.write(d)

    def delete(self, id):
        try:
            self.cursor.execute("delete from copies where id=%s", [id])
            self.db.commit()
        except Exception as e:
            self.set_status(403)
            self.write("Probably existing copies")


class RentsHandler(tornado.web.RequestHandler):
    db = MySQLdb.connect("localhost", "phillers", "", "rest", charset="utf8", use_unicode=True)
    cursor = db.cursor()

    def get(self):
        self.db.commit()
        self.cursor.execute("select * from rents")
        desc = [x[0] for x in self.cursor.description]
        d = []
        for row in self.cursor.fetchall():
            rowd = dict(zip(desc, row))
            id = rowd["id"]
            rowd["link"] = "/rents/" + str(id)
            rowd["date1"] = str(rowd["date1"])  # .isoformat()
            rowd["date2"] = str(rowd["date2"])  # .isoformat()
            d.append(rowd)
            print(rowd)
        self.write({"list": d})

    def post(self):
        try:
            data = json.loads(self.request.body.decode("utf-8"))
        except:
            self.add_header("Accept", "application/json")
            self.set_status(400)
            return
        print(data)
        if "copy_id" not in data:
            self.send_error(400)
            return
        if "holder_id" not in data:
            self.send_error(400)
            return
        try:
            self.cursor.execute("select * from copies where id=%s", [data["copy_id"]])
            r = self.cursor.fetchone()
            d = dict(zip([x[0] for x in self.cursor.description], r))
            print(d)
            if d["holder"] is not None:
                self.set_status(403)
                self.write("Already rent")
                return
            self.cursor.execute("update copies set holder=%s where id=%s", [data["holder_id"], data["copy_id"]])
            self.cursor.execute("insert into rents(date1, copy_id, holder_id) values(%s, %s, %s)",
                                [datetime.date.today(), data["copy_id"], data["holder_id"]])
            self.db.commit()
        except Exception as e:
            print(e)
            self.set_status(403)
            self.write("Probably bad data")
            return
        self.cursor.execute("select max(id) from rents where copy_id=%s", [data["copy_id"]])
        r = self.cursor.fetchone()
        print(r)
        self.add_header("Location", "/rents/" + str(r[0]))
        self.set_status(201)


class RentHandler(tornado.web.RequestHandler):
    db = MySQLdb.connect("localhost", "phillers", "", "rest", charset="utf8", use_unicode=True)
    cursor = db.cursor()

    def get(self, id):
        if self.cursor.execute("select * from rents where id =%s", [id]) < 1:
            self.send_error(404)
        desc = [x[0] for x in self.cursor.description]
        row = self.cursor.fetchone()
        d = dict(zip(desc, row))
        d["id"]
        d["date1"] = str(d["date1"])  # .isoformat()
        d["date2"] = str(d["date2"])  # .isoformat()
        self.cursor.execute("select game_id, owner from copies where id=%s", [d["copy_id"]])
        [game, user] = self.cursor.fetchone()
        self.cursor.execute("select title from games where id=%s", [game])
        d["game"] = self.cursor.fetchone()[0]
        self.cursor.execute("select name from users where id=%s", [user])
        d["owner"] = self.cursor.fetchone()[0]
        self.cursor.execute("select name from users where id=%s", [d["holder_id"]])
        d["holder_name"] = self.cursor.fetchone()[0]
        self.write(d)

    def delete(self, id):
        try:
            self.cursor.execute("select copy_id from rents where id=%s", [id])
            copy_id = self.cursor.fetchone()[0]
            self.cursor.execute("update rents set date2=%s where id=%s", [datetime.date.today(), id])
            self.cursor.execute("update copies set holder=NULL where id=%s", [copy_id])
            self.db.commit()
        except Exception as e:
            print(e)
            self.set_status(403)
            self.write("Probably bad data")


class UserRentsHandler(tornado.web.RequestHandler):
    db = MySQLdb.connect("localhost", "phillers", "", "rest", charset="utf8", use_unicode=True)
    cursor = db.cursor()

    def get(self, id):
        self.db.commit()
        self.cursor.execute("select * from rents where holder_id=%s", [id])
        desc = [x[0] for x in self.cursor.description]
        d = []
        for row in self.cursor.fetchall():
            print(row)
            rowd = dict(zip(desc, row))
            id2 = rowd["id"]
            self.cursor.execute("select title from games join copies on games.id=copies.game_id where copies.id=%s",
                                [rowd["copy_id"]])
            rowd["game_name"] = self.cursor.fetchone()[0]
            rowd["date1"] = str(rowd["date1"])  # .isoformat()
            rowd["date2"] = str(rowd["date2"])  # .isoformat()
            rowd["link"] = "/rents/" + str(id2)
            d.append(rowd)
            print(rowd)
        self.write({"list": d})


class TransferHandler(tornado.web.RequestHandler):
    db = MySQLdb.connect("localhost", "phillers", "", "rest", charset="utf8", use_unicode=True)
    cursor = db.cursor()

    def post(self):
        try:
            data = json.loads(self.request.body.decode("utf-8"))
        except:
            self.add_header("Accept", "application/json")
            self.set_status(400)
            return
        print(data)
        if "copy_id" not in data:
            self.send_error(400)
            return
        if "holder_id" not in data:
            self.send_error(400)
            return
        if "new_holder" not in data:
            self.send_error(400)
            return
        try:
            self.cursor.execute("select * from copies where id=%s", [data["copy_id"]])
            r = self.cursor.fetchone()
            print(r)
            d = dict(zip([x[0] for x in self.cursor.description], r))
            print(d)
            if d["holder"] != int(data["holder_id"]):
                self.set_status(403)
                self.write("Wrong holder")
                return
            self.cursor.execute("select id from rents where copy_id=%s and holder_id=%s and date2 is NULL",
                                [data["copy_id"], data["holder_id"]])
            rid = self.cursor.fetchone()[0]
            self.cursor.execute("update rents set date2=%s where id=%s", [datetime.date.today(), rid])
            self.cursor.execute("update copies set holder=%s where id=%s", [data["new_holder"], data["copy_id"]])
            self.cursor.execute("insert into rents(date1, copy_id, holder_id) values(%s, %s, %s)",
                                [datetime.date.today(), data["copy_id"], data["new_holder"]])
            self.db.commit()
        except Exception as e:
            print(e)
            self.set_status(403)
            self.write("Probably bad data")
            return
        self.cursor.execute("select max(id) from rents where copy_id=%s", [data["copy_id"]])
        r = self.cursor.fetchone()
        print(r)
        self.add_header("Location", "/rents/" + str(r[0]))
        self.set_status(201)


if __name__ == "__main__":
    application = tornado.web.Application([
        ("/", MainHandler),
        ("/games/?", GamesHandler),
        ("/games/([0-9]+)/?", GameHandler),
        ("/games/([0-9]+)/copies/?", GameCopyHandler),
        ("/games/[0-9]+/copies/([0-9]+)/?", CopyHandler),
        ("/rents/?", RentsHandler),
        ("/rents/([0-9]+)/?", RentHandler),
        ("/transfer/?", TransferHandler),
        ("/users/?", UsersHandler),
        ("/users/([0-9]+)/?", UserHandler),
        ("/users/([0-9]+)/copies/?", UserCopyHandler),
        ("/users/[0-9]+/copies/([0-9]+)/?", CopyHandler),
        ("/users/([0-9]+)/rents/?", UserRentsHandler),
    ])
    application.listen(8888)
    tornado.ioloop.IOLoop.instance().start()
