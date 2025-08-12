#!/bin/bash

# --- Script Description ---
# This script restarts the 'treeapp.service', checks its status,
# then stages all changes and commits them to a Git repository.
# Finally, it pushes the changes to the remote repository.
# The script will exit immediately if any command fails.

# --- Usage ---
# To run this script, use the following command:
# ./restart_and_commit.sh "Your commit message goes here"

# --- Main Logic ---

# Use 'set -e' to exit immediately if a command exits with a non-zero status.
# This is a simple but effective way to handle errors and prevent the script
# from continuing if a command (like `sudo systemctl restart`) fails.
set -e

# Check if a commit message was provided as an argument.
# $# holds the number of arguments passed to the script.
if [ "$#" -ne 1 ]; then
    echo "Error: You must provide a commit message."
    echo "Usage: $0 \"Your commit message here\""
    exit 1
fi

# The commit message is stored in the first argument, $1.
COMMIT_MESSAGE="$1"

# --- Service Operations ---

echo "Attempting to restart the treeapp.service..."
# Restart the specified systemd service.
# The script will exit here if this command fails.
sudo systemctl restart treeapp.service

echo "restarting"
# Display the status of the service to confirm it's running.
sudo systemctl status treeapp.service

echo "restarted"

# --- Git Operations ---

echo "Staging all changes for commit..."
# Stage all changes in the current directory.
git add .

echo "Committing with message: \"$COMMIT_MESSAGE\""
# Commit the staged changes with the provided message.
git commit -m "$COMMIT_MESSAGE"

echo "Pulling the latest changes from the remote repository..."
# It's good practice to pull before pushing to avoid conflicts.
git pull

echo "Pushing changes to the remote repository..."
# Push the committed changes to the remote branch.
git push

echo "Script finished successfully!"

