import youtube_dl

VIDEO_FORMATS = ["144p", "240p", "360p", "480p", "720", "1080p", "1440p", "2160p", "DASH video"]
AUDIO_FORMATS = ["DASH audio", "tiny"]





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
                "format_note": format["format_note"]
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
            "formats": formats
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
        except:
            return {}
    if info.get("_type") == "playlist":
        return (info.get("entries"))
    else:
        return ([info])

