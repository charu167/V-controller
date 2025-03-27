import { Request, Response } from "express";

export default async function generateRunScript(req: Request, res: Response) {
  try {
    const {
      REDIS_HOST,
      REDIS_PASSWORD,
      AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY,
      AWS_REGION,
    } = process.env;

    const script = `#!/bin/bash
# Setup script for V-Worker

# Docker check
command -v docker >/dev/null 2>&1 || {
  echo >&2 "Docker is not installed. Please install it manually and re-run this script.";
  exit 1;
}

# Python check
command -v python3 >/dev/null 2>&1 || {
  echo >&2 "Python3 is not installed. Please install it manually and re-run this script.";
  exit 1;
}

# Virtual environment setup
python3 -m venv venv
source venv/bin/activate

# Clone notification server
if [ ! -d "V-notification-server" ]; then
  git clone https://github.com/charu167/V-notification-server.git
fi

pip install --upgrade pip
pip install -r V-notification-server/requirements.txt

# Start notification server
cd V-notification-server
python3 mac_notifications.py &

# Pull and run processor container
docker pull charu167/v-processor:latest
docker run -d \\
  --platform linux/arm64 \\
  --name v-processor \\
  -e REDIS_HOST=${REDIS_HOST} \\
  -e REDIS_PASSWORD=${REDIS_PASSWORD} \\
  -e AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID} \\
  -e AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY} \\
  -e AWS_REGION=${AWS_REGION} \\
  -e BASE_URL=https://v-controller.charu-tech.com \\
  -e LOCAL_URL=host.docker.internal \\
  charu167/v-processor:latest

echo "Worker setup complete!"
`;

    res.setHeader("Content-Disposition", "attachment; filename=run.sh");
    res.setHeader("Content-Type", "text/x-sh");
    res.status(200).send(script);
  } catch (error) {
    console.error("Error generating run script:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}
