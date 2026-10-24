# Puffx Ofline GPT

![Puffx Ofline GPT animated banner](assets/puffx-motion.svg)


Puffx Ofline GPT is a ChatGPT-inspired chat interface that sends prompts to an AI model running locally through [Ollama](https://ollama.com/). It is an independent project, is not affiliated with OpenAI, and does not run ChatGPT or OpenAI models.

**Powered by Puffx Host · Made with Nitin Mehta.**

The app has no Python packages to install. It uses Python's standard library for its local web server. Your browser stores chat history in that browser's local storage. Chat messages go from the browser to this computer's Python server, then to Ollama at `127.0.0.1:11434`.

## What you need

- Windows 10+, macOS 14+, or a supported Linux distribution
- Python 3.11 or newer (Python 3.11+ is recommended)
- Ollama installed and running
- About 2 GB free space to download the default `qwen2.5:3b` model (Ollama lists this model at about 1.9 GB). The model also needs working memory while it runs; generation speed depends on your CPU, GPU, and RAM.
- Internet for the first Ollama/model download. After that, the local model can chat without internet.

Smaller choices include `qwen2.5:1.5b` and `qwen2.5:0.5b`. They use less storage and memory but may give weaker answers. Each model has its own license; check its Ollama model page before distributing it.

## 1. Get the project files

This repository is private. Sign in to GitHub with an account that has access, then use either method:

**Download ZIP:** open the repository page, select **Code → Download ZIP**, and extract the ZIP to a folder you can find again.

**Git:** install Git, then clone the repository:

```bash
git clone https://github.com/puffxhost/Puffx-Offline-GPT.git
cd Puffx-Offline-GPT
```

## 2. Install Python

Install Python 3.11 or newer from [python.org/downloads](https://www.python.org/downloads/). You can also use your operating system's package manager (commands are below). After installing, open a new terminal and check the version.

### Windows

During Python setup, enable **Add Python to PATH** if the installer offers that option.

PowerShell:

```powershell
py -3 --version
```

Command Prompt (CMD):

```bat
py -3 --version
```

If `py` is not found, try `python --version`. If neither command works, install Python from python.org, close the terminal, open a new one, and try again.

### macOS

Check whether Python 3 is available:

```bash
python3 --version
```

If needed, install Python from [python.org/downloads/macos](https://www.python.org/downloads/macos/). If you already use Homebrew, `brew install python` is another option.

### Linux

Use the package command for your distribution. On some older releases, the package manager may install a Python version that is too old; use a current OS release or python.org's platform guidance if `python3 --version` is below 3.11.

Ubuntu, Debian, and Linux Mint:

```bash
sudo apt update
sudo apt install -y python3 git curl
```

Fedora:

```bash
sudo dnf install -y python3 git curl
```

Arch Linux and Manjaro:

```bash
sudo pacman -Syu --needed python git curl
```

openSUSE:

```bash
sudo zypper install python3 git curl
```

Verify:

```bash
python3 --version
```

## 3. Install Ollama

Ollama runs the model locally. Use its official download page for the installer for your system: [ollama.com/download](https://ollama.com/download).

### Windows

Download and run the Windows installer from [Ollama for Windows](https://ollama.com/download/windows). When installation finishes, open the Ollama app from the Start menu. It normally runs its local service in the background.

PowerShell users can also use Ollama's official installer command:

```powershell
irm https://ollama.com/install.ps1 | iex
```

### macOS

Download Ollama for macOS from [ollama.com/download](https://ollama.com/download) and install/open the app. The official macOS and Linux install command is also available in Terminal:

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### Linux

Install with Ollama's official Linux installer:

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

On a system with systemd, check that its service is running:

```bash
systemctl status ollama
```

If the service is installed but stopped:

```bash
sudo systemctl start ollama
```

On a setup without systemd, start Ollama in its own terminal and leave that terminal open:

```bash
ollama serve
```

Verify the CLI is installed:

```bash
ollama --version
```

## 4. Download the AI model

The first model download needs internet. Run this in PowerShell, CMD, Terminal, or your Linux shell:

```bash
ollama pull qwen2.5:3b
```

Wait for the download to finish. To see downloaded models later:

```bash
ollama list
```

You can also try a smaller model if your computer has limited memory:

```bash
ollama pull qwen2.5:1.5b
```

If you choose a different model, set `OLLAMA_MODEL` when starting Puffx Ofline GPT (see **Choose another model** below).

## 5. Start Puffx Ofline GPT

Keep Ollama running. Start Puffx Ofline GPT from the project folder in a second terminal. The app server stays attached to that terminal; leave it open while chatting. Stop it with **Ctrl+C**.

### Windows: easiest way

Double-click `START_OFFLINEGPT.bat`. It opens a server window and then opens the browser at [http://127.0.0.1:8000](http://127.0.0.1:8000). Keep the server window open while using the app; close it when finished.

If Windows says Python was not found, install Python, reopen the folder, and double-click the launcher again.

### Windows PowerShell

Open PowerShell in the project folder. One way is to open that folder in File Explorer, click the address bar, type `powershell`, and press Enter. Then run:

```powershell
py -3 server.py
```

If the `py` launcher is not available but `python` works:

```powershell
python server.py
```

### Windows Command Prompt (CMD)

Open Command Prompt in the project folder. In File Explorer, click the folder address bar, type `cmd`, and press Enter. Then run:

```bat
py -3 server.py
```

Or, if needed:

```bat
python server.py
```

### macOS Terminal

Open Terminal, change to the extracted/cloned project folder, then run:

```bash
cd ~/Downloads/Puffx-Offline-GPT
python3 server.py
```

Replace `~/Downloads/Puffx-Offline-GPT` with the actual folder path if you extracted it somewhere else. You can drag the folder into Terminal after typing `cd ` to insert its path.

### Linux Terminal

Change to the project folder and start the server:

```bash
cd ~/Downloads/Puffx-Offline-GPT
python3 server.py
```

Replace the example folder path with the location where you extracted or cloned the project.

## 6. Open and use the app

On the same computer where `server.py` is running, open:

[http://127.0.0.1:8000](http://127.0.0.1:8000)

Type a prompt and press **Enter**. Use **Shift+Enter** for a new line. The sidebar keeps conversations in your browser's local storage. Use the theme button to switch between dark and light mode.

The server binds to `127.0.0.1`, so the app is available only on that computer by default. A phone or another computer cannot open this address as a way to reach your PC.

## Choose another model

First download the model, for example:

```bash
ollama pull qwen2.5:1.5b
```

Then stop Puffx Ofline GPT with Ctrl+C and restart Puffx Ofline GPT with the matching environment variable.

PowerShell:

```powershell
$env:OLLAMA_MODEL = "qwen2.5:1.5b"
py -3 server.py
```

Windows CMD:

```bat
set OLLAMA_MODEL=qwen2.5:1.5b
py -3 server.py
```

macOS / Linux:

```bash
OLLAMA_MODEL=qwen2.5:1.5b python3 server.py
```

## Offline use

You need internet once to install Ollama and download the model. After the model is downloaded, open/run Ollama and start `server.py`; the chat itself uses the local model and does not call a cloud AI API. If internet is off, externally hosted fonts may not load, but the interface falls back to system fonts.


## Complete setup checklist

Use this checklist if this is your first time setting up the project. The quick steps above are enough for most computers; this section includes terminal-specific commands and recovery checks.

### Windows: install prerequisites with winget (optional)

Open PowerShell or Windows Terminal. If `winget` is available, install Git, Python, and Ollama:

```powershell
winget install --id Git.Git -e
winget install --id Python.Python.3.12 -e
winget install --id Ollama.Ollama -e
```

Close and reopen the terminal after installation so PATH changes take effect. Check the tools:

```powershell
git --version
py -3 --version
ollama --version
```

If `winget` is missing or a package ID is unavailable, use the official installers linked in the sections above. In the Python installer, enable **Add Python to PATH** if shown. For Windows CMD, the equivalent version checks are `git --version`, `py -3 --version`, and `ollama --version`.

### Get the source and enter the folder

PowerShell and CMD:

```powershell
git clone https://github.com/puffxhost/Puffx-Offline-GPT.git
cd Puffx-Offline-GPT
```

macOS and Linux:

```bash
git clone https://github.com/puffxhost/Puffx-Offline-GPT.git
cd Puffx-Offline-GPT
```

The repository is private; GitHub must be signed in to an account that has access. If Git asks you to authenticate, use GitHub's supported browser sign-in or credential manager. Do not put a personal access token in the clone URL or save one in this project. If you downloaded a ZIP, extract it first and `cd` into the extracted project directory instead.

### Download and verify a model

Start/open Ollama, then use the same model tag the app is configured for:

```text
ollama pull qwen2.5:3b
ollama list
```

The app's default is `qwen2.5:3b`. Model tags matter: having `qwen2.5:7b` does not count as having `qwen2.5:3b`. A model download needs internet and several GB of free disk space during download. Once the pull finishes, you can disconnect from the internet for local chatting.

Optional smaller models for lower-memory machines:

```text
ollama pull qwen2.5:1.5b
ollama pull qwen2.5:0.5b
```

Select the model you downloaded by setting `OLLAMA_MODEL` in the same terminal used to start the web server. Examples are in **Choose another model**. To confirm Ollama answers independently of the web UI, run `ollama run qwen2.5:3b`, ask it a question, then type `/bye` to exit.

### Start the web app in each terminal

Keep Ollama running in the background (or in its own terminal), then start the Python server from the project folder:

| System / shell | Command |
| --- | --- |
| Windows PowerShell | `py -3 server.py` |
| Windows CMD | `py -3 server.py` |
| macOS | `python3 server.py` |
| Linux | `python3 server.py` |

The first-party Windows launcher `START_OFFLINEGPT.bat` can start the server and open the browser. If Windows blocks the launcher, right-click it and choose **Open**, or run `py -3 server.py` in PowerShell/CMD. Keep the server terminal open, then visit `http://127.0.0.1:8000` on that same computer. Stop the server with **Ctrl+C**.

### Linux service and alternate shell notes

On systemd Linux installations, inspect and start Ollama with:

```bash
sudo systemctl status ollama
sudo systemctl start ollama
```

If your system does not use systemd, open a second terminal and run `ollama serve`, leaving it open. If `python3` is missing, install the OS package `python3`; if `git` is missing, install `git`. On Debian/Ubuntu/Mint use `sudo apt install python3 git`; Fedora uses `sudo dnf install python3 git`; Arch/Manjaro uses `sudo pacman -S python git`; openSUSE uses `sudo zypper install python3 git`.

macOS users can install Git and Python using Apple's Command Line Tools and the official Python installer, or use Homebrew if already installed (`brew install git python`). Ollama's macOS desktop app must be opened once to start its local service.

### Network, port, and custom Ollama endpoint

This project intentionally listens on loopback (`127.0.0.1`) so another machine on your network cannot reach it by default. If port 8000 is busy, choose another local port:

PowerShell:

```powershell
$env:PORT = '8001'
py -3 server.py
```

CMD:

```bat
set PORT=8001
py -3 server.py
```

macOS/Linux:

```bash
PORT=8001 python3 server.py
```

Then open `http://127.0.0.1:8001`. If Ollama runs on a different local endpoint, set `OLLAMA_URL` before starting the server; it must be reachable from the same computer. PowerShell: `$env:OLLAMA_URL = 'http://127.0.0.1:11434'`; CMD: `set OLLAMA_URL=http://127.0.0.1:11434`; macOS/Linux: `OLLAMA_URL=http://127.0.0.1:11434 python3 server.py`.

### Update the project later

From the project folder, close the running app with Ctrl+C, then update source files with Git:

```text
git pull
```

Restart it using the same command as before. If you used the ZIP method, download and extract the latest ZIP, then move any local changes you need before replacing the old folder.

### Fast diagnostic order

1. Check `python --version`/`py -3 --version`/`python3 --version` and `ollama --version`.
2. Check `ollama list` and confirm the exact configured model tag is present.
3. Open the Ollama app, or start its service (`ollama serve` where applicable).
4. Start `server.py` and keep the terminal open; read any startup error printed there.
5. Visit the exact loopback URL and refresh after Ollama or the model starts.
6. If the port is in use, set `PORT` in that terminal and visit the matching port.

## Troubleshooting

**The browser says it cannot connect to `127.0.0.1:8000`.** Start `server.py` first and keep its terminal window open. Use the same computer and exact URL. If the port is already in use, choose another port:

PowerShell:

```powershell
$env:PORT = "8001"
py -3 server.py
```

CMD:

```bat
set PORT=8001
py -3 server.py
```

macOS / Linux:

```bash
PORT=8001 python3 server.py
```

Then open `http://127.0.0.1:8001`.

**The app says Ollama is not running.** Open the Ollama app on Windows/macOS. On Linux, check `systemctl status ollama`, or run `ollama serve` in another terminal if there is no service. Then refresh the Puffx Ofline GPT page.

**The app says the model is not downloaded.** Run `ollama pull qwen2.5:3b`, wait for it to finish, then refresh the page.

**`ollama` is not recognized/not found.** Finish installing Ollama, open a new terminal, and run `ollama --version`. On Windows, make sure the Ollama app has been opened after install.

**The model is slow or the computer runs out of memory.** Close other demanding apps or try `qwen2.5:1.5b` or `qwen2.5:0.5b`. Larger models need more memory and a faster CPU/GPU.

## Privacy and limits

- Prompts are sent to the Ollama service on the same computer; this app does not send chat prompts to an OpenAI or other cloud AI API.
- The browser stores conversation history in local storage on that browser profile. Clearing browser data removes that history.
- The app loads fonts from Google Fonts when internet is available; the font request is separate from chat prompts. With no internet, system fonts are used.
- Model output can be incorrect. Check important information.
- Puffx Ofline GPT is a UI and local API bridge; model weights are downloaded separately and are governed by the model publisher's terms.

## License

The Puffx Ofline GPT app code is licensed under MIT. See [LICENSE](LICENSE). Model licenses are separate.







