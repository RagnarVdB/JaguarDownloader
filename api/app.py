from flask import Flask, jsonify, request
from downloader import Downloader, get_info
from flask_cors import CORS
app = Flask(__name__)
CORS(app)
videos = []


@app.route("/add", methods=["POST"])
def add_url():
    url = request.json["url"]
    print(url)
    infos = get_info(url)
    sent_videos = []
    for info in infos:
        video = Downloader(url, info)
        videos.append(video)
        client_info = video.get_client_info()
        sent_videos.append(client_info)
    return jsonify(sent_videos)


@app.route("/start", methods=["POST"])
def start():
    settings = request.json["settings"]
    path = request.json["path"]
    for id in settings:
        for video in videos:
            if video.id == id:
                video.start_download(settings[id], path)
    return jsonify({"status": "succeed"})


if __name__ == "__main__":
    app.run(debug=True)
