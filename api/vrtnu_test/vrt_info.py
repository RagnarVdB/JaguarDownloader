import youtube_dl
import json

url = "https://www.vrt.be/vrtnu/a-z/wat-zegt-de-wetenschap/2019-2020/wat-zegt-de-wetenschap-d20200224-s2019-2020a8/"

def get_info(url):
    opts = {"ignoreerrors": False}
    with youtube_dl.YoutubeDL(opts) as ydl:
        try:
            info = ydl.extract_info(url, download=False)
        except youtube_dl.utils.DownloadError:
            print('error')

    if info["extractor"] == "youtube":
        # do youtube stuff
        return None
    elif info["extractor"] == "canvas":
        # do vrt.nu stuff
        for format in info["formats"]:
            

        return {
            "id": info["id"],
            "title": info["title"],
            "desc": info["description"],
            "thumbnail": info["thumbnail"],
            "duration": info["duration"],
            "progress": 0,
            "settings": {},
        }