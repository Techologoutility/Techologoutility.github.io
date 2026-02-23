import tkinter as tk
from time import strftime


def update_time():
    current_time = strftime("%I:%M:%S %p")
    clock_label.config(text=current_time)
    clock_label.after(1000, update_time)


root = tk.Tk()
root.title("Digital Clock")
root.geometry("420x180")
root.configure(bg="#111827")
root.resizable(False, False)

clock_label = tk.Label(
    root,
    font=("Consolas", 36, "bold"),
    bg="#111827",
    fg="#22d3ee",
)
clock_label.pack(expand=True)

update_time()
root.mainloop()
