#!/usr/bin/env python3
"""
Simple REST API to control Ollama systemd service.
Used by Home Assistant to toggle Ollama on/off.
"""

from flask import Flask, jsonify
import subprocess
import os

app = Flask(__name__)

def run_systemctl(action):
    """Run systemctl command with sudo."""
    try:
        result = subprocess.run(
            ['sudo', 'systemctl', action, 'ollama'],
            capture_output=True,
            text=True,
            timeout=30
        )
        return result.returncode == 0, result.stdout + result.stderr
    except Exception as e:
        return False, str(e)

def get_status():
    """Get ollama service status."""
    try:
        result = subprocess.run(
            ['systemctl', 'is-active', 'ollama'],
            capture_output=True,
            text=True,
            timeout=10
        )
        return result.stdout.strip() == 'active'
    except:
        return False

@app.route('/status', methods=['GET'])
def status():
    """Return current ollama status."""
    is_active = get_status()
    return jsonify({
        'state': 'on' if is_active else 'off',
        'active': is_active
    })

@app.route('/start', methods=['POST', 'GET'])
def start():
    """Start ollama service."""
    success, msg = run_systemctl('start')
    return jsonify({
        'success': success,
        'state': 'on' if get_status() else 'off',
        'message': msg
    })

@app.route('/stop', methods=['POST', 'GET'])
def stop():
    """Stop ollama service."""
    success, msg = run_systemctl('stop')
    return jsonify({
        'success': success,
        'state': 'on' if get_status() else 'off',
        'message': msg
    })

@app.route('/toggle', methods=['POST', 'GET'])
def toggle():
    """Toggle ollama service."""
    if get_status():
        return stop()
    else:
        return start()

if __name__ == '__main__':
    # Listen only on localhost for security
    app.run(host='127.0.0.1', port=5111, debug=False)
