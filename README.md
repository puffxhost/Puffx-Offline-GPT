# Puffx Ofline GPT

**Private AI chat running locally on your computer.**

**Powered by Puffx Host · Made with Nitin Mehta.**

![Animated Puffx Ofline GPT chat interface](assets/puffx-ui-motion.svg)

Puffx Ofline GPT is a ChatGPT-inspired interface for chatting with a local language model through [Ollama](https://ollama.com/). It is an independent project and is not affiliated with OpenAI. It does not run ChatGPT or OpenAI models.

## Features

- ChatGPT-inspired dark interface with light theme, prompt suggestions, and a conversation sidebar.
- Runs inference through an Ollama model on your computer; no cloud AI API key is needed.
- Keeps conversation history in your browser's local storage.
- Python web server uses only Python's standard library; no Python packages or build tools are required.
- Binds to `127.0.0.1` by default, so the web app is only available on the same computer.
- Animated interface preview above. The app respects the operating system's reduced-motion preference.

## Requirements

- Windows 10 or newer, macOS, or a supported Linux distribution.
- Python 3.11 or newer.
- Ollama installed and running.
- Internet access for the initial software and model downloads. After downloading the model, chat can run without internet.
- Free disk space for the selected model. The default `qwen2.5:3b` download is about 1.9 GB; RAM and generation speed depend on your computer.

Smaller alternatives such as `qwen2.5:1.5b` or `qwen2.5:0.5b` need less memory and disk space, but may give weaker answers. Model weights have separate licenses; check the model's terms before redistributing them.

## Quick start

If Git, Python, and Ollama are already installed, clone the private repo, download the model, and start the app:

```bash
git clone https://github.com/puffxhost/Puffx-Offline-GPT.git
cd Puffx-Offline-GPT
ollama pull qwen2.5:3b
python3 server.py
```

On Windows, use `py -3 server.py` instead of `python3 server.py`, or double-click `START_OFFLINEGPT.bat`. Open [http://127.0.0.1:8000](http://127.0.0.1:8000) in a browser on the same computer. The first model download needs internet; later chats use the local model.

> This repository is private. You must be signed in to GitHub with an account that has access. If you do not use Git, download the ZIP from **Code → Download ZIP**, extract it, and open a terminal in the extracted folder.

## Detailed setup

### 1. Get the project

Choose one method:

**Git (recommended):** install Git if needed, then run these commands in PowerShell, CMD, Terminal, or a Linux shell:

```text
git clone https://github.com/puffxhost/Puffx-Offline-GPT.git
cd Puffx-Offline-GPT
```

**ZIP:** on the repository page, choose **Code → Download ZIP** and extract it. Open PowerShell, CMD, or Terminal in the extracted `Puffx-Offline-GPT` folder before running the commands below. In File Explorer, click the address bar and type `powershell` or `cmd` to open a terminal in that folder.

### 2. Windows 10 or newer

#### Install Python, Git, and Ollama

Install Python 3.11+ from [python.org](https://www.python.org/downloads/). In the installer, enable **Add Python to PATH** if offered. Install Ollama from [ollama.com/download/windows](https://ollama.com/download/windows), then open the Ollama app once. Git is needed only if you use the clone option above.

If you have `winget`, you can install the tools from PowerShell or Windows Terminal:

```powershell
winget install --id Git.Git -e
winget install --id Python.Python.3.12 -e
winget install --id Ollama.Ollama -e
```

Close and reopen the terminal after installation. Check the commands:

```powershell
git --version
py -3 --version
ollama --version
```

In Command Prompt (CMD), the same checks are:

```bat
git --version
py -3 --version
ollama --version
```

If `py` is unavailable, try `python --version`. If `ollama` is not recognized, reopen the Ollama app and start a new terminal.

#### Download the model

Run in PowerShell or CMD:

```text
ollama pull qwen2.5:3b
ollama list
```

Wait for the download to finish. `ollama list` should show the exact `qwen2.5:3b` tag. The app checks the full model tag, so a different size such as `qwen2.5:7b` is not a substitute for `qwen2.5:3b` unless you configure that tag.

#### Start the app

Keep Ollama running. From the project folder, choose one:

- **Easiest:** double-click `START_OFFLINEGPT.bat`. Keep its server window open while chatting.
- **PowerShell:** `py -3 server.py`
- **Command Prompt:** `py -3 server.py`

If `py` is unavailable but `python` works, use `python server.py`. When the terminal says the server is ready, open [http://127.0.0.1:8000](http://127.0.0.1:8000). Press **Ctrl+C** in the server terminal to stop it.

### 3. macOS

#### Install the tools

Install Python 3.11+ from [python.org](https://www.python.org/downloads/macos/), or use Homebrew if it is already installed:

```bash
brew install python git
```

Install Ollama from [ollama.com/download](https://ollama.com/download), open the Ollama app, and install Git if you plan to clone the repository. Check that Terminal can find Python and Ollama:

```bash
python3 --version
git --version
ollama --version
```

#### Download the model and run

In Terminal, clone the repo and download the model:

```bash
git clone https://github.com/puffxhost/Puffx-Offline-GPT.git
cd Puffx-Offline-GPT
ollama pull qwen2.5:3b
python3 server.py
```

If you downloaded a ZIP, `cd` into its extracted folder instead of cloning. Keep Terminal open and visit [http://127.0.0.1:8000](http://127.0.0.1:8000). Stop the server with **Ctrl+C**.

### 4. Linux

#### Install Python and Git

Install Python 3, Git, and curl using your distribution's package manager. On older OS releases, check that `python3 --version` is at least 3.11.

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

#### Install and start Ollama

Use the official Ollama installer:

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

On systemd systems, check and start the service if necessary:

```bash
systemctl status ollama
sudo systemctl start ollama
```

On systems without systemd, open a separate terminal and run `ollama serve`, leaving that terminal open. Confirm the CLI is available with `ollama --version`.

#### Download the model and run

```bash
git clone https://github.com/puffxhost/Puffx-Offline-GPT.git
cd Puffx-Offline-GPT
ollama pull qwen2.5:3b
python3 server.py
```

For a ZIP download, change into the extracted project folder instead. Keep the app terminal open and visit [http://127.0.0.1:8000](http://127.0.0.1:8000). Stop it with **Ctrl+C**.

## Choose another model

Download a model first, for example:

```text
ollama pull qwen2.5:1.5b
```

Stop the app server with **Ctrl+C**. Set `OLLAMA_MODEL` and restart it in the same terminal.

**PowerShell:**

```powershell
$env:OLLAMA_MODEL = 'qwen2.5:1.5b'
py -3 server.py
```

**Windows CMD:**

```bat
set OLLAMA_MODEL=qwen2.5:1.5b
py -3 server.py
```

**macOS / Linux:**

```bash
OLLAMA_MODEL=qwen2.5:1.5b python3 server.py
```

The model tag must match a model shown by `ollama list`.

## Run offline

Install Ollama and download the model while you have internet. After that, start Ollama and Puffx Ofline GPT as usual; the chat requests go to Ollama on your computer and do not use a cloud AI service. The app can load without internet, although Google Fonts will fall back to system fonts. No separate API key is required.

## Change the port or Ollama address

The app listens on `127.0.0.1` and port `8000` by default. If port 8000 is already in use, set another port before launching:

**PowerShell:**

```powershell
$env:PORT = '8001'
py -3 server.py
```

**Windows CMD:**

```bat
set PORT=8001
py -3 server.py
```

**macOS / Linux:**

```bash
PORT=8001 python3 server.py
```

Then open `http://127.0.0.1:8001`. To use a different Ollama endpoint, set `OLLAMA_URL` in the same terminal before starting the app. For example, PowerShell: `$env:OLLAMA_URL = 'http://127.0.0.1:11434'`; CMD: `set OLLAMA_URL=http://127.0.0.1:11434`; macOS/Linux: `OLLAMA_URL=http://127.0.0.1:11434 python3 server.py`.

The server binds to loopback by design. Other computers and phones cannot connect to it through your PC's network address.

## Update the project

If you cloned with Git, stop the app with **Ctrl+C**, then run this from the project folder:

```text
git pull
```

Start the app again with the same command. If you use the ZIP method, download and extract the latest ZIP. Keep any local edits you want before replacing the old folder.

## Troubleshooting

| Problem | What to do |
| --- | --- |
| Browser cannot connect to `127.0.0.1:8000` | Start `server.py` first and keep its terminal open. Use the same computer and exact address. If the port is busy, [change the port](#change-the-port-or-ollama-address). |
| “Ollama not running” | Open the Ollama app on Windows/macOS. On Linux, check `systemctl status ollama`; if there is no systemd service, run `ollama serve` in another terminal. Refresh the app. |
| “Model not downloaded” | Run `ollama list` and confirm the exact configured tag. For the default, run `ollama pull qwen2.5:3b`, wait for completion, and refresh. |
| `ollama` command not found | Finish installing Ollama, reopen the Ollama app, then open a fresh terminal and run `ollama --version`. |
| `py` or `python` command not found on Windows | Reinstall Python and enable **Add Python to PATH**. Reopen the terminal. Try `py -3 --version` or `python --version`. |
| `python3` command not found on macOS/Linux | Install Python 3 from the linked installer or your distribution's package manager. Confirm with `python3 --version`. |
| Port 8000 is already in use | Set `PORT` to another value such as `8001` in the server terminal and open the matching URL. |
| Model is slow or the computer runs out of memory | Close other heavy apps, use a smaller model such as `qwen2.5:1.5b`, or use a computer with more memory. Larger models usually need more resources. |
| Fonts look different while offline | Google Fonts need internet. The app falls back to fonts already installed on your computer. |

## Privacy and limitations

- Chat prompts travel from your browser to this computer's Python server and then to Ollama at `127.0.0.1:11434` by default. This app does not send prompts to OpenAI or another cloud AI API.
- Conversation history is stored in local storage in the browser profile you use. Clearing that browser's site data deletes the saved history.
- Google Fonts may be requested when internet is available; chat prompts are not sent with those font requests. Offline, system fonts are used.
- Model replies can be inaccurate. Verify important information independently.
- Ollama downloads the model weights separately. Model availability and license terms are controlled by the model publisher.

## Credits and license

**Puffx Ofline GPT · Powered by Puffx Host · Made with Nitin Mehta.**

The app code is licensed under the MIT License; see [LICENSE](LICENSE). Model weights have their own terms.


