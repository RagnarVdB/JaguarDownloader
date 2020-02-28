from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import youtube_dl
import subprocess as sp
import os
import tempfile
import json
import urllib
import webbrowser
from engineio.async_drivers import gevent

PATH = os.path.join(tempfile.gettempdir(), "JaguarDownloader")
VERSIONURL = "http://jaguardownloader.netlify.com/version.json"

app = Flask(__name__, template_folder="./", static_folder="./static")
socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app)
VIDEO_FORMATS = ["144p", "240p", "360p", "480p", "720", "1080p", "1440p", "2160p", "DASH video"]
AUDIO_FORMATS = ["DASH audio", "tiny"]


class MyLogger:
    def debug(self, msg):
        pass

    def warning(self, msg):
        pass

    def error(self, msg):
        print(msg)
        emit_error("DownloadError", msg)


def emit_error(type, msg):
    emit("errorlog", {"type": type, "msg": msg})


class InfoGetter():
    def __init__(self, url, info):
        self.url = url
        self.info = info
        self.settings = {}
        self.id = info.get("id")

    def get_client_info(self):
        formats = []
        for format in self.info["formats"]:
            form = {
                "id": format["format_id"],
                "ext": format["ext"],
                "filesize": format["filesize"],
                "format_note": format["format_note"],
                "fps": format["fps"]
            }
            if form["format_note"] in VIDEO_FORMATS:
                form["type"] = "video"
                formats.append(form)
            elif form["format_note"] in AUDIO_FORMATS:
                form["type"] = "audio"
                formats.append(form)
        date_info = self.info["upload_date"]
        date = date_info[:4] + "/" + date_info[4:6] + "/" + date_info[6:]

        return {
            "id": self.info["id"],
            "title": self.info["title"],
            "channel": self.info["uploader"],
            "thumbnail": self.info["thumbnail"],
            "date": date,
            "progress": 0,
            "settings": {},
            "formats": formats,
            "duration": self.info["duration"]
        }

    def my_hook(self, d):
        if "_percent_str" in d:
            value = int(float(d["_percent_str"][:-1]))
        status = d["status"]


def get_info(url):
    opts = {"ignoreerrors": False}
    with youtube_dl.YoutubeDL(opts) as ydl:
        try:
            info = ydl.extract_info(url, download=False)
        except youtube_dl.utils.DownloadError:
            return {}
    if info.get("_type") == "playlist":
        return (info.get("entries"))
    else:
        return ([info])


class Downloader():
    def __init__(self, id, settings, path="%userprofile%/downloads"):
        self.id = id
        self.settings = settings
        self.path = path

    def emitprogress(self, val, status):
        emit("progress", {self.id: {"progress": val, "status": status}})
        socketio.sleep(0.01)

    def my_hook(self, d):
        if "_percent_str" in d:
            value = int(float(d["_percent_str"][:-1]))
            self.emitprogress(value, "downloading ...")

    def convert(self):
        self.emitprogress(0, "converting ...")
        original_ext = self.ext
        ext = self.settings["ext"]
        filepath = os.path.join(PATH, "{}.{}".format(self.id, original_ext))
        new_filepath = os.path.join(PATH, "{}.{}".format(self.id, ext))
        if self.settings["type"] == "video":
            tot_fr = self.settings["format"][0]["fps"] * self.settings["duration"]
            print(tot_fr)

        cmd2 = 'ffmpeg -i "{0}" "{1}"'.format(filepath, new_filepath)
        p = sp.Popen(cmd2, stderr=sp.STDOUT, universal_newlines=True, stdout=sp.PIPE, stdin=sp.PIPE)
        if self.settings["type"] == "video":
            for line in p.stdout:
                print(line)
                lst = line.split(" ")
                for j in lst:
                    if j == "":
                        lst.remove(j)
                frame = lst[1]
                if frame.isdigit():
                    try:
                        fr = int(frame)
                        perc = int(100 * (fr / tot_fr))
                        self.emitprogress(perc, "converting ...")
                    except ValueError:
                        pass
        p.communicate()
        os.remove(filepath)

    def start_download(self):
        if self.settings["convert"]:
            if self.settings["type"] == "video":
                self.ext = "mkv"
            else:
                self.ext = self.settings["format"][0]["ext"]
        else:
            self.ext = self.settings["ext"]
        if self.settings["ext"] in ["mp3", "m4a"]:
            opts = {
                "format": self.settings["format"][0]["id"],
                "merge_output_format": self.ext,
                "logger": MyLogger(),
                "progress_hooks": [self.my_hook],
                "outtmpl": '{}/%(id)s.%(ext)s'.format(PATH)
            }
        else:
            opts = {
                "format": self.settings["format"][0]["id"] + " + " + self.settings["format"][1]["id"],
                "merge_output_format": self.ext,
                "logger": MyLogger(),
                "progress_hooks": [self.my_hook],
                "outtmpl": '{}/%(id)s.%(ext)s'.format(PATH)
            }

        with youtube_dl.YoutubeDL(opts) as ydl:
            try:
                ydl.download([self.id])
            except youtube_dl.utils.DownloadError:
                emit_error("DownloadError", "Something went wrong!")

        if self.settings["convert"]:
            self.convert()

        try:
            os.rename(os.path.join(PATH, "{}.{}".format(self.id, self.settings["ext"])),
                      os.path.join(self.path, "{}.{}".format(self.settings["filename"], self.settings["ext"])))
        except FileNotFoundError:
            try:
                os.rename(os.path.join(PATH, "{}.{}".format(self.id, self.settings["ext"])),
                          os.path.join(os.path.join(os.path.expanduser("~"), "Downloads"),
                                       "{}.{}".format(self.settings["filename"], self.settings["ext"])))
                emit_error("DownloadError", "Illegal path, video moved to downloads folder")
            except:
                emit_error("DownloadError", "Couldn't find downloaded file")
                try:
                    os.remove(os.path.join(PATH, "{}.{}".format(self.id, self.settings["ext"])))
                except:
                    print("error moving file")
        except FileExistsError:
            emit_error("FileExistsError", 'file already exists!')
            try:
                os.remove(os.path.join(PATH, "{}.{}".format(self.id, self.settings["ext"])))
            except:
                print("error moving file")

        self.emitprogress(100, "FINISHED!")


# Starting application

@app.route("/")
def main():
    return render_template("index.html")


# api requests

@app.route("/add", methods=["POST"])
def add_url():
    url = request.json["url"]
    infos = get_info(url)
    if len(infos) == 0:
        return jsonify([])
    sent_videos = []
    for info in infos:
        video = InfoGetter(url, info)
        client_info = video.get_client_info()
        sent_videos.append(client_info)
    return jsonify(sent_videos)


@app.route("/directory", methods=["GET"])
def directory_chooser():
    # reading stdout from seperate file because HTML doesn't have a directory dialog
    # and Flask blocks tkinter windows
    p = sp.Popen("foldergetter.exe", stdout=sp.PIPE)
    out = p.communicate()
    return jsonify(str(out[0].decode("utf-8")).rstrip())


@app.route("/defaultpath", methods=["GET"])
def defaultpath():
    return jsonify(os.path.join(os.path.expanduser("~"), "Downloads"))

@app.route("/version", methods=["GET"])
def version():
    response = urllib.request.urlopen(VERSIONURL)
    data = response.read().decode('utf-8')
    return jsonify(json.loads(data))

@app.route("/close", methods=["GET"])
def close():
    os._exit(0)


@socketio.on("start")
def start_handler(data):
    all_settings = data["settings"]
    path = data["path"]
    for id in all_settings:
        video = Downloader(id, all_settings[id], path)
        video.start_download()


if __name__ == "__main__":
    # uncomment for production:
    # webbrowser.get("C:/Program Files (x86)/Google/Chrome/Application/chrome.exe %s --app=http://127.0.0.1:5000").open("")
    socketio.run(app, debug=True)
