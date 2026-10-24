# OfflineGPT

OfflineGPT is a ChatGPT-inspired chat interface that sends prompts to an AI model running locally through [Ollama](https://ollama.com/). It is an independent project, is not affiliated with OpenAI, and does not run ChatGPT or OpenAI models.

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
git clone https://github.com/puffxhost/OfflineGPT.git
cd OfflineGPT
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

If you choose a different model, set `OLLAMA_MODEL` when starting OfflineGPT (see **Choose another model** below).

## 5. Start OfflineGPT

Keep Ollama running. Start OfflineGPT from the project folder in a second terminal. The app server stays attached to that terminal; leave it open while chatting. Stop it with **Ctrl+C**.

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
cd ~/Downloads/OfflineGPT
python3 server.py
```

Replace `~/Downloads/OfflineGPT` with the actual folder path if you extracted it somewhere else. You can drag the folder into Terminal after typing `cd ` to insert its path.

### Linux Terminal

Change to the project folder and start the server:

```bash
cd ~/Downloads/OfflineGPT
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

Then stop OfflineGPT with Ctrl+C and restart it with the matching environment variable.

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

**The app says Ollama is not running.** Open the Ollama app on Windows/macOS. On Linux, check `systemctl status ollama`, or run `ollama serve` in another terminal if there is no service. Then refresh the OfflineGPT page.

**The app says the model is not downloaded.** Run `ollama pull qwen2.5:3b`, wait for it to finish, then refresh the page.

**`ollama` is not recognized/not found.** Finish installing Ollama, open a new terminal, and run `ollama --version`. On Windows, make sure the Ollama app has been opened after install.

**The model is slow or the computer runs out of memory.** Close other demanding apps or try `qwen2.5:1.5b` or `qwen2.5:0.5b`. Larger models need more memory and a faster CPU/GPU.

## Privacy and limits

- Prompts are sent to the Ollama service on the same computer; this app does not send chat prompts to an OpenAI or other cloud AI API.
- The browser stores conversation history in local storage on that browser profile. Clearing browser data removes that history.
- The app loads fonts from Google Fonts when internet is available; the font request is separate from chat prompts. With no internet, system fonts are used.
- Model output can be incorrect. Check important information.
- OfflineGPT is a UI and local API bridge; model weights are downloaded separately and are governed by the model publisher's terms.

## License

The OfflineGPT app code is licensed under MIT. See [LICENSE](LICENSE). Model licenses are separate.
