#!/bin/bash

# This script downloads the latest ISOs for various Linux distributions.
#
# USAGE:
#   - Run without arguments to download all predefined ISOs:
#     ./download_isos.sh
#
#   - Run with arguments to download a specific file:
#     ./download_isos.sh <URL> <Target Directory> <Target Filename>
#

# --- Base Configuration ---
BASE_DIR="/mnt/media_drive_1/isos"

# --- Function to download a file ---
download_iso() {
    local url="$1"
    local dir="$2"
    local filename="$3"
    
    if [ ! -d "$dir" ]; then
        echo "Error: Directory $dir does not exist."
        exit 1
    fi

    echo "Downloading $filename to $dir..."
    # -c continues partial downloads, -O specifies the full output path
    wget -c -O "$dir/$filename" "$url"
    echo "$filename download finished."
}

# --- Main Logic ---

# If arguments are provided, use them for a specific download.
if [ "$#" -eq 3 ]; then
    echo "--- Single File Download Mode ---"
    download_iso "$1" "$2" "$3"
    exit 0
fi

# If no arguments, run the full download sequence.
echo "--- Full Download Mode ---"

# Ubuntu
UBUNTU_DESKTOP_URL="https://releases.ubuntu.com/24.04.2/ubuntu-24.04.2-desktop-amd64.iso"
UBUNTU_SERVER_URL="https://releases.ubuntu.com/24.04.2/ubuntu-24.04.2-live-server-amd64.iso"
download_iso "$UBUNTU_DESKTOP_URL" "$BASE_DIR/ubuntu/desktop" "ubuntu-24.04.2-desktop-amd64.iso"
download_iso "$UBUNTU_SERVER_URL" "$BASE_DIR/ubuntu/server" "ubuntu-24.04.2-live-server-amd64.iso"

# Linux Mint
MINT_CINNAMON_URL="https://mirrors.advancedhosters.com/linuxmint/iso/stable/21.3/linuxmint-21.3-cinnamon-64bit.iso"
MINT_MATE_URL="https://mirrors.advancedhosters.com/linuxmint/iso/stable/21.3/linuxmint-21.3-mate-64bit.iso"
download_iso "$MINT_CINNAMON_URL" "$BASE_DIR/mint/cinnamon" "linuxmint-21.3-cinnamon-64bit.iso"
download_iso "$MINT_MATE_URL" "$BASE_DIR/mint/mate" "linuxmint-21.3-mate-64bit.iso"

# Arch Linux
ARCH_URL="http://mirror.rackspace.com/archlinux/iso/2025.08.01/archlinux-2025.08.01-x86_64.iso"
download_iso "$ARCH_URL" "$BASE_DIR/arch" "archlinux-2025.08.01-x86_64.iso"

# Fedora Workstation
FEDORA_URL="https://download.fedoraproject.org/pub/fedora/linux/releases/40/Workstation/x86_64/iso/Fedora-Workstation-Live-x86_64-40-1.14.iso"
download_iso "$FEDORA_URL" "$BASE_DIR/fedora/workstation" "Fedora-Workstation-Live-x86_64-40-1.14.iso"

# Debian Netinstall
DEBIAN_URL="https://cdimage.debian.org/debian-cd/current/amd64/iso-cd/debian-12.5.0-amd64-netinst.iso"
download_iso "$DEBIAN_URL" "$BASE_DIR/debian/netinst" "debian-12.5.0-amd64-netinst.iso"

echo "--- All downloads complete. ---"
