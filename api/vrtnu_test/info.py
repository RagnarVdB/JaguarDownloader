import youtube_dl
import json

# url = "https://www.vrt.be/vrtnu/a-z/wat-zegt-de-wetenschap/2019-2020/wat-zegt-de-wetenschap-d20200224-s2019-2020a8/"
url = "https://www.youtube.com/watch?v=o0fG_lnVhHw&t=1047s"

opts = {"ignoreerrors": False}
with youtube_dl.YoutubeDL(opts) as ydl:
    try:
        info = ydl.extract_info(url, download=False)
    except youtube_dl.utils.DownloadError:
        print('error')

with open('youtube.json', 'w') as file:
    json.dump(info, file)