from flask import Flask, jsonify, request
from downloader import InfoGetter, get_info
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import youtube_dl
import subprocess as sp

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app)
videos = []


class MyLogger:
    def debug(self, msg):
        pass

    def warning(self, msg):
        pass

    def error(self, msg):
        print(msg)


class Downloader():
    def __init__(self, id, settings, path="C:/users/ragna/Desktop"):
        self.id = id
        self.settings = settings
        self.path = path

    def emitprogress(self, val):
        emit('progress', {self.id: val})
        socketio.sleep(0.01)

    def my_hook(self, d):
        if "_percent_str" in d:
            value = int(float(d["_percent_str"][:-1]))
            print(value)
            self.emitprogress(value)

    def start_download(self):
        if self.settings["convert"]:
            ext = "mkv"
        else:
            ext = self.settings["ext"]
        if self.settings['ext'] in ['mp3', 'm4a']:
            opts = {
                "format": self.settings["format"][0],
                "merge_output_format": ext,
                "logger": MyLogger(),
                "progress_hooks": [self.my_hook],
                "outtmpl": '/tmp/%(id)s.%(ext)s'
            }
        else:
            opts = {
                "format": self.settings["format"][0]["id"] + " + " + self.settings["format"][1]["id"],
                "merge_output_format": ext,
                "logger": MyLogger(),
                "progress_hooks": [self.my_hook],
                "outtmpl": '/tmp/%(id)s.%(ext)s'
            }

        with youtube_dl.YoutubeDL(opts) as ydl:
            print("starting download")
            ydl.download([self.id])




@app.route("/add", methods=["POST"])
def add_url():
    url = request.json["url"]
    print(url)
    infos = get_info(url)
    sent_videos = []
    for info in infos:
        video = InfoGetter(url, info)
        videos.append(video)
        client_info = video.get_client_info()
        sent_videos.append(client_info)
    return jsonify(sent_videos)


@socketio.on('start')
def start_handler(all_settings):
    for id in all_settings:
        video = Downloader(id, all_settings[id])
        video.start_download()


@socketio.on("message")
def handle_message(msg):
    print(msg)
    emit("message", "this is a message from the server")


if __name__ == "__main__":
    socketio.run(app, debug=True)
