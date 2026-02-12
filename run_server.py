#!/usr/bin/env python3
"""
Скрипт для запуска обоих приложений в одном процессе
Идеален для Render и других PaaS с ограничением на количество процессов
"""

import subprocess
import sys
import os
import time
import shutil
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor

# Цвета для вывода
GREEN = '\033[92m'
YELLOW = '\033[93m'
RED = '\033[91m'
BLUE = '\033[94m'
RESET = '\033[0m'

def print_info(msg):
    print(f"{BLUE}[INFO]{RESET} {msg}")

def print_success(msg):
    print(f"{GREEN}[✓]{RESET} {msg}")

def print_error(msg):
    print(f"{RED}[✗]{RESET} {msg}")

def build_frontend():
    """Собрать Frontend в статические файлы"""
    frontend_path = Path("frontend")
    
    if not frontend_path.exists():
        print_error("frontend папка не найдена")
        return False
    
    print_info("Сборка Frontend...")
    
    # Убедиться что есть node_modules
    node_modules = frontend_path / "node_modules"
    if not node_modules.exists():
        print_info("Установка Frontend зависимостей...")
        if not subprocess.run("npm install", shell=True, cwd=str(frontend_path)).returncode == 0:
            print_error("Ошибка при установке зависимостей Frontend")
            return False
    
    # Собрать
    if not subprocess.run("npm run build", shell=True, cwd=str(frontend_path)).returncode == 0:
        print_error("Ошибка при сборке Frontend")
        return False
    
    print_success("Frontend собран")
    
    # Скопировать dist в backend (если нужно)
    dist_path = frontend_path / "dist"
    if dist_path.exists():
        print_info("Frontend готов к раздаче со статическими файлами")
        return True
    
    return False

def start_backend():
    """Запустить Backend сервер"""
    print_info("Запуск Backend API...")
    
    # Определить хост и порт
    api_host = os.getenv('API_HOST', '0.0.0.0')
    api_port = os.getenv('API_PORT', '8000')
    
    cmd = f"{sys.executable} -m uvicorn main:app --host {api_host} --port {api_port}"
    
    # Если есть frontend/dist, включить раздачу статики
    if Path("frontend/dist").exists():
        print_info("Будут раданы статические файлы Frontend")
        cmd += " --app-dir=frontend/dist"
    
    # Запустить backend (блокирующий вызов)
    process = subprocess.Popen(cmd, shell=True)
    return process

def update_frontend_cors():
    """Обновить CORS для Frontend в зависимости от окружения"""
    frontend_host = os.getenv('FRONTEND_HOST', 'localhost')
    frontend_port = os.getenv('FRONTEND_PORT', '5173')
    frontend_url = os.getenv('FRONTEND_URL', f'http://{frontend_host}:{frontend_port}')
    
    main_py = Path("main.py")
    if not main_py.exists():
        return
    
    content = main_py.read_text()
    
    # Проверить есть ли CORS настройка
    if "CORSMiddleware" in content:
        print_info(f"Frontend URL для CORS: {frontend_url}")
        # Здесь можно добавить логику обновления CORS если нужно

def main():
    print(f"{BLUE}{'='*60}{RESET}")
    print(f"{BLUE}VKR Server - Run Backend + Build Frontend{RESET}")
    print(f"{BLUE}{'='*60}{RESET}\n")
    
    # Определить окружение
    is_production = os.getenv('ENVIRONMENT', 'development').lower() == 'production'
    is_render = os.getenv('RENDER') == 'true'
    
    if is_render:
        print_success("Запуск на Render (production режим)")
    else:
        print_success(f"Режим: {'Production' if is_production else 'Development'}")
    
    # Обновить CORS для Frontend
    update_frontend_cors()
    
    # На production собрать frontend
    if is_production or is_render:
        if not build_frontend():
            print_error("Не удалось собрать Frontend")
            return False
    
    # Запустить Backend
    print(f"\n{BLUE}{'='*60}{RESET}")
    process = start_backend()
    
    # Ждать прерывания
    try:
        process.wait()
    except KeyboardInterrupt:
        print_info("\nОстановка сервера...")
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
        print_success("Сервер остановлен")
    
    return True

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except Exception as e:
        print_error(f"Ошибка: {e}")
        sys.exit(1)
