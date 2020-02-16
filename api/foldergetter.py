import tkinter as tk
from tkinter import filedialog
root = tk.Tk()
root.withdraw()


def get_filepath():
    file_path = filedialog.askdirectory()
    return file_path


if __name__ == "__main__":
    print(get_filepath())
