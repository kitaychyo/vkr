#!/usr/bin/env python3
"""
Полный скрипт развертывания проекта VKR на сервере
Запустите: python deploy.py
"""

import subprocess
import sys
import os
import time
import platform
from pathlib import Path

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

def print_warning(msg):
    print(f"{YELLOW}[!]{RESET} {msg}")

def print_error(msg):
    print(f"{RED}[✗]{RESET} {msg}")

def run_command(cmd, shell=False, cwd=None):
    """Выполнить команду и вернуть результат"""
    try:
        if isinstance(cmd, str) and not shell:
            cmd = cmd.split()
        result = subprocess.run(cmd, shell=shell, cwd=cwd, capture_output=False, text=True)
        return result.returncode == 0
    except Exception as e:
        print_error(f"Ошибка при выполнении команды: {e}")
        return False

def check_command_exists(cmd):
    """Проверить наличие команды В системе"""
    try:
        subprocess.run(f"where {cmd}" if platform.system() == "Windows" else f"which {cmd}", 
                      shell=True, capture_output=True)
        return True
    except:
        return False

def create_env_file():
    """Создать .env файл если его нет"""
    env_path = Path(".env")
    if env_path.exists():
        print_info(".env файл найден")
        return
    
    print_info("Создание .env файла...")
    env_content = """# Database Configuration
POSTGRES_USER=vkr_user
POSTGRES_PASSWORD=vkr_password
POSTGRES_DB=vkr_db
POSTGRES_PORT=5432
DATABASE_URL=postgresql://vkr_user:vkr_password@localhost:5432/vkr_db

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000

# Frontend Configuration
FRONTEND_PORT=5173
"""
    
    with open(env_path, "w") as f:
        f.write(env_content)
    print_success(".env файл создан")

def docker_health_check():
    """Проверить доступность Docker демона"""
    try:
        result = subprocess.run("docker ping" if platform.system() == "Windows" else "docker ps", 
                              shell=True, capture_output=True, text=True, timeout=5)
        return result.returncode == 0
    except:
        return False

def start_postgres():
    """Запустить PostgreSQL контейнер"""
    print_info("Проверка PostgreSQL контейнера...")
    
    # Загрузить переменные из .env
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except:
        os.environ.setdefault('POSTGRES_USER', 'vkr_user')
        os.environ.setdefault('POSTGRES_PASSWORD', 'vkr_password')
        os.environ.setdefault('POSTGRES_DB', 'vkr_db')
        os.environ.setdefault('POSTGRES_PORT', '5432')
    
    # Проверить запущен ли контейнер
    check_cmd = 'docker ps --filter "name=vkr_db" --format "{{.Names}}"'
    result = subprocess.run(check_cmd, shell=True, capture_output=True, text=True)
    
    if "vkr_db" in result.stdout:
        print_success("PostgreSQL контейнер уже запущен")
        return True
    
    # Проверить существует ли контейнер
    check_cmd = 'docker ps -a --filter "name=vkr_db" --format "{{.Names}}"'
    result = subprocess.run(check_cmd, shell=True, capture_output=True, text=True)
    
    if "vkr_db" in result.stdout:
        print_info("Запуск существующего PostgreSQL контейнера...")
        return run_command("docker start vkr_db", shell=True)
    
    # Создать новый контейнер
    print_info("Создание нового PostgreSQL контейнера...")
    postgres_user = os.getenv('POSTGRES_USER', 'vkr_user')
    postgres_pass = os.getenv('POSTGRES_PASSWORD', 'vkr_password')
    postgres_db = os.getenv('POSTGRES_DB', 'vkr_db')
    postgres_port = os.getenv('POSTGRES_PORT', '5432')
    
    cmd = (f'docker run -d --name vkr_db '
           f'-e POSTGRES_USER={postgres_user} '
           f'-e POSTGRES_PASSWORD={postgres_pass} '
           f'-e POSTGRES_DB={postgres_db} '
           f'-p {postgres_port}:5432 '
           f'-v vkr_data:/var/lib/postgresql/data '
           f'postgres:18')
    
    success = run_command(cmd, shell=True)
    if success:
        print_success("PostgreSQL контейнер создан")
        print_info("Ожидание запуска БД (10 секунд)...")
        time.sleep(10)
        return True
    else:
        print_error("Ошибка при создании PostgreSQL контейнера")
        return False

def install_python_deps():
    """Установить Python зависимости"""
    print_info("Установка Python зависимостей...")
    
    if not Path("requirements.txt").exists():
        print_error("requirements.txt не найден")
        return False
    
    if run_command([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"]):
        print_success("Python зависимости установлены")
        return True
    else:
        print_error("Ошибка при установке Python зависимостей")
        return False

def run_migrations():
    """Запустить миграции Alembic"""
    print_info("Запуск миграций БД...")
    
    # Подождать пока БД станет доступной
    max_attempts = 30
    for attempt in range(max_attempts):
        try:
            from database.db import engine
            with engine.connect() as conn:
                print_success("БД доступна")
                break
        except Exception as e:
            if attempt == max_attempts - 1:
                print_error(f"БД не доступна после {max_attempts} попыток")
                return False
            time.sleep(1)
    
    if run_command("alembic upgrade head", shell=True):
        print_success("Миграции выполнены")
        return True
    else:
        print_warning("Ошибка при выполнении миграций (может быть уже применены)")
        return True

def install_frontend_deps():
    """Установить зависимости Frontend"""
    print_info("Установка зависимостей Frontend...")
    
    frontend_path = Path("frontend")
    if not frontend_path.exists():
        print_error("frontend папка не найдена")
        return False
    
    if not Path("frontend/package.json").exists():
        print_error("frontend/package.json не найден")
        return False
    
    if not check_command_exists("npm"):
        print_error("npm не установлен. Установите Node.js")
        return False
    
    if run_command("npm install", shell=True, cwd=str(frontend_path)):
        print_success("Frontend зависимости установлены")
        return True
    else:
        print_error("Ошибка при установке Frontend зависимостей")
        return False

def main():
    print(f"{BLUE}{'='*60}{RESET}")
    print(f"{BLUE}VKR Deployment Script{RESET}")
    print(f"{BLUE}{'='*60}{RESET}\n")
    
    # Проверить OS
    os_type = platform.system()
    print_info(f"Операционная система: {os_type}")
    
    # Проверить Python версию
    if sys.version_info < (3, 8):
        print_error("Требуется Python 3.8 или выше")
        return False
    
    print_success(f"Python версия: {sys.version.split()[0]}")
    
    # Создать .env файл
    create_env_file()
    
    # Проверить Docker
    if check_command_exists("docker"):
        print_success("Docker установлен")
        if docker_health_check():
            print_success("Docker демон доступен")
            if not start_postgres():
                print_error("Не удалось запустить PostgreSQL контейнер")
                return False
        else:
            print_error("Docker демон недоступен")
            print_warning("Убедитесь, что Docker Desktop запущен (для Windows/Mac)")
            return False
    else:
        print_warning("Docker не найден")
        print_warning("Убедитесь, что PostgreSQL запущена и доступна по DATABASE_URL")
    
    # Установить Python зависимости
    if not install_python_deps():
        return False
    
    # Запустить миграции
    if not run_migrations():
        print_warning("Продолжаем несмотря на ошибку миграций...")
    
    # Установить Frontend зависимости
    print_info("Проверка Node.js...")
    if check_command_exists("node"):
        print_success("Node.js установлен")
        if not install_frontend_deps():
            print_warning("Не удалось установить Frontend зависимости")
            print_warning("Frontend может работать некорректно")
    else:
        print_warning("Node.js не найден")
        print_warning("Установите Node.js для работы Frontend")
        print_warning("Скачайте отсюда: https://nodejs.org/")
    
    # Готово
    print(f"\n{BLUE}{'='*60}{RESET}")
    print(f"{GREEN}Развертывание готово!{RESET}")
    print(f"{BLUE}{'='*60}{RESET}\n")
    
    print_info("Для запуска проекта выполните:")
    print(f"{YELLOW}python -m uvicorn main:app --host 0.0.0.0 --port 8000{RESET}")
    print(f"{YELLOW}(в отдельном терминале) cd frontend && npm run dev{RESET}\n")
    
    print_info("Доступ к приложению:")
    print(f"{YELLOW}Backend API: http://localhost:8000{RESET}")
    print(f"{YELLOW}Swagger docs: http://localhost:8000/docs{RESET}")
    print(f"{YELLOW}Frontend: http://localhost:5173{RESET}\n")
    
    return True

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print_warning("\nПрограмма прервана пользователем")
        sys.exit(1)
    except Exception as e:
        print_error(f"Неожиданная ошибка: {e}")
        sys.exit(1)
