from flask import Flask, jsonify, request
from downloader import InfoGetter, get_info
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import youtube_dl
import subprocess as sp
import tkinter as tk
from tkinter import filedialog
import os

PATH = "tmp/"

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

    def emitprogress(self, val, status):
        emit('progress', {self.id: {"progress": val, "status": status}})
        print({self.id: {"progress": val, "status": status}})
        socketio.sleep(0.01)

    def my_hook(self, d):
        if "_percent_str" in d:
            value = int(float(d["_percent_str"][:-1]))
            print(value)
            self.emitprogress(value, 'downloading ...')

    def convert(self):
        self.emitprogress(0, "converting ...")
        original_ext = self.settings["format"][0]["ext"]
        ext = self.settings["ext"]
        filepath = r"{}{}.{}".format(PATH, self.id, original_ext)
        new_filepath = r"{}{}.{}".format(PATH, self.id, ext)
        if self.settings["type"] == "video":
            cmd1 = 'ffprobe -v error -count_frames -select_streams v:0 -show_entries ' \
                   'stream=nb_read_frames -of ' \
                   'default=nokey=1:noprint_wrappers=1 "{0}"'.format(filepath)
            print("count frames ...")
            print(cmd1)
            self.emitprogress(0, 'counting frames ...')
            p = sp.Popen(cmd1, stdout=sp.PIPE, stderr=sp.STDOUT, stdin=sp.PIPE)
            output = str(p.communicate())
            numbers = []
            for c in output:
                if c.isdigit():
                    numbers.append(c)
            tot_fr = int("".join(numbers))

        cmd2 = 'ffmpeg -i "{0}" "{1}"'.format(filepath, new_filepath)
        p = sp.Popen(cmd2, stderr=sp.STDOUT, universal_newlines=True, stdout=sp.PIPE, stdin=sp.PIPE)
        if self.settings["type"] == "video":
            for line in p.stdout:
                lst = line.split(" ")
                for j in lst:
                    if j == "":
                        lst.remove(j)
                frame = lst[1]
                if frame.isdigit():
                    try:
                        fr = int(frame)
                        perc = int(100 * (fr / tot_fr))
                        print(perc)
                        self.emitprogress(perc, "converting ...")
                    except ValueError:
                        pass

    def start_download(self):
        if self.settings["convert"]:
            if self.settings["type"] == "video":
                ext = "mkv"
            else:
                ext = "webm"
        else:
            ext = self.settings["ext"]
        if self.settings['ext'] in ['mp3', 'm4a']:
            opts = {
                "format": self.settings["format"][0]["id"],
                "merge_output_format": ext,
                "logger": MyLogger(),
                "progress_hooks": [self.my_hook],
                "outtmpl": '/{}%(id)s.%(ext)s'.format(PATH)
            }
        else:
            opts = {
                "format": self.settings["format"][0]["id"] + " + " + self.settings["format"][1]["id"],
                "merge_output_format": ext,
                "logger": MyLogger(),
                "progress_hooks": [self.my_hook],
                "outtmpl": '/{}%(id)s.%(ext)s'.format(PATH)
            }

        with youtube_dl.YoutubeDL(opts) as ydl:
            print("starting download", self.settings["convert"])
            print(self.id, opts)
            ydl.download([self.id])

        print(self.settings["convert"])
        if self.settings["convert"]:
            print("converting...")
            self.convert()
        self.emitprogress(100, "FINISHED!")


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


@app.route("/directory", methods=["GET"])
def directory_chooser():
    # reading stdout from seperate file because HTML doesn't have a directory dialog
    # and Flask blocks TKinter windows
    p = sp.Popen("foldergetter.exe", stdout=sp.PIPE)
    out = p.communicate()
    return jsonify(str(out[0].decode("utf-8")))

@socketio.on('start')
def start_handler(all_settings):
    for id in all_settings:
        video = Downloader(id, all_settings[id])
        video.start_download()


if __name__ == "__main__":
    socketio.run(app, debug=True)

    p = sp.Popen("foldergetter.py", stdout=sp.PIPE, )
    out = p.communicate()
    print("output: ", out)
