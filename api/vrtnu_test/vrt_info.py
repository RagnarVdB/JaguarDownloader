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
    print(info["extractor"])
    if info["extractor"] == "youtube":
        # do youtube stuff
        return None
    elif info["extractor"] == "Canvas":
        # do vrt.nu stuff
        formats = []
        for format in info["formats"]:
            if format["ext"] == "mp4" or format["ext"] == "m4a":
                if format.get("format_note") == "DASH audio":
                    note = "DASH audio"
                    format_type = "audio"
                else:
                    note = str(format["width"]) + "p"
                    format_type = "video"
                formats.append({
                    "ext": format["ext"],
                    "filesize": format.get("filesize"),
                    "format_note": note,
                    "fps": format["fps"],
                    "id": format["format_id"],
                    "type": format_type
                })
        print("returning")
        return {
            "id": info["id"],
            "title": info["title"],
            "desc": info["description"],
            "thumbnail": info["thumbnail"],
            "duration": info["duration"],
            "progress": 0,
            "settings": {},
            "formats": formats
        }


info = get_info(url)
with open('test.json', 'w') as file:
    json.dump(info, file)