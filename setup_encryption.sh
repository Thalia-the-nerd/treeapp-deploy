#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status.

# --- Configuration ---
ENCRYPTED_VOLUME_FILE="/var/mongodb-luks-volume"
VOLUME_SIZE="2G"
MAPPER_NAME="mongodb_encrypted"
MONGO_DATA_DIR="/var/lib/mongodb_encrypted"
KEY_FILE="/etc/luks_keys/mongodb.key"
MONGO_CONF="/etc/mongod.conf"

# --- WARNING ---
echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
echo "!!! WARNING: This script will stop MongoDB and modify its storage.    !!!"
echo "!!! It is HIGHLY recommended to back up your database before proceeding. !!!"
echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
read -p "Have you backed up your data and wish to continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Aborting."
    exit 1
fi

# --- Step 1: Stop MongoDB and Install Tools ---
echo "--> Stopping services..."
sudo systemctl stop mongod
sudo systemctl stop treeapp.service

echo "--> Installing cryptsetup..."
sudo apt-get update
sudo apt-get install -y cryptsetup

# --- Step 2: Create and Encrypt the Volume ---
echo "--> Creating a ${VOLUME_SIZE} file for the encrypted volume at ${ENCRYPTED_VOLUME_FILE}..."
sudo fallocate -l ${VOLUME_SIZE} ${ENCRYPTED_VOLUME_FILE}

echo "--> Encrypting the volume. You will be asked to create a password."
echo "!!! IMPORTANT: You MUST remember this password to recover your data. !!!"
sudo cryptsetup luksFormat ${ENCRYPTED_VOLUME_FILE}

echo "--> Opening the encrypted volume..."
sudo cryptsetup luksOpen ${ENCRYPTED_VOLUME_FILE} ${MAPPER_NAME}

# --- Step 3: Format and Mount the Volume ---
echo "--> Formatting the new volume with ext4 filesystem..."
sudo mkfs.ext4 /dev/mapper/${MAPPER_NAME}

echo "--> Finding original MongoDB data directory..."
ORIGINAL_MONGO_DIR=$(sudo grep -oP '(?<=dbPath: ).*' ${MONGO_CONF} | tr -d '[:space:]')
if [ -z "$ORIGINAL_MONGO_DIR" ]; then
    echo "Could not automatically find the original dbPath in ${MONGO_CONF}. Using /var/lib/mongodb as a default."
    ORIGINAL_MONGO_DIR="/var/lib/mongodb"
fi
echo "Original dbPath found: ${ORIGINAL_MONGO_DIR}"

TEMP_MOUNT="/mnt/mongodb_temp"
echo "--> Mounting the new encrypted volume to ${TEMP_MOUNT}..."
sudo mkdir -p ${TEMP_MOUNT}
sudo mount /dev/mapper/${MAPPER_NAME} ${TEMP_MOUNT}

echo "--> Copying existing MongoDB data to the new encrypted volume..."
sudo rsync -av ${ORIGINAL_MONGO_DIR}/ ${TEMP_MOUNT}/

# --- Step 4: Configure Auto-Mount on Boot ---
echo "--> Creating a keyfile at ${KEY_FILE} to unlock the volume automatically..."
sudo mkdir -p $(dirname ${KEY_FILE})
sudo dd if=/dev/urandom of=${KEY_FILE} bs=1024 count=4
sudo chmod 0400 ${KEY_FILE}

echo "--> Adding the keyfile to the LUKS volume..."
sudo cryptsetup luksAddKey ${ENCRYPTED_VOLUME_FILE} ${KEY_FILE}

echo "--> Configuring /etc/crypttab for auto-unlock..."
echo "${MAPPER_NAME} ${ENCRYPTED_VOLUME_FILE} ${KEY_FILE} luks" | sudo tee -a /etc/crypttab > /dev/null

echo "--> Creating the final mount point: ${MONGO_DATA_DIR}"
sudo mkdir -p ${MONGO_DATA_DIR}

echo "--> Configuring /etc/fstab for auto-mount..."
echo "/dev/mapper/${MAPPER_NAME} ${MONGO_DATA_DIR} ext4 defaults,nofail 0 2" | sudo tee -a /etc/fstab > /dev/null

# --- Step 5: Finalize and Restart ---
echo "--> Unmounting the temporary volume..."
sudo umount ${TEMP_MOUNT}
sudo rmdir ${TEMP_MOUNT}

echo "--> Mounting the new volume to its final destination..."
sudo mount -a

echo "--> Updating MongoDB configuration to use the new data directory..."
sudo sed -i "s|dbPath:.*|dbPath: ${MONGO_DATA_DIR}|" ${MONGO_CONF}

echo "--> Restarting services..."
sudo systemctl start mongod
sudo systemctl start treeapp.service

echo "--> Checking service status..."
sudo systemctl status mongod --no-pager
sudo systemctl status treeapp.service --no-pager

echo "---"
echo "✅ Encryption setup is complete!"
echo "Your MongoDB data is now stored in an encrypted volume at ${MONGO_DATA_DIR}."
echo "The volume will be automatically unlocked and mounted on system startup."
