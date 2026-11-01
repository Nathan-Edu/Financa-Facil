import os
import sys
import time
import socket
import signal
import shutil
import subprocess
from pathlib import Path


# ==========================================================
# FINANÇA FÁCIL - INICIALIZADOR DO AMBIENTE
# ==========================================================

ROOT = Path(__file__).resolve().parent

SERVICOS = [
    {
        "nome": "Backend",
        "pasta": ROOT / "backend",
        "comando": "npm run start:dev",
        "porta": 3000,
        "timeout": 60,
        "prisma": True,
        "env": True,
    },
    {
        "nome": "Web",
        "pasta": ROOT / "frontend",
        "comando": "npm start -- --port 4200",
        "porta": 4200,
        "timeout": 90,
        "prisma": False,
        "env": False,
    },
    {
        "nome": "Mobile",
        "pasta": ROOT / "mobile",
        "comando": "npm start -- --port 4201",
        "porta": 4201,
        "timeout": 90,
        "prisma": False,
        "env": False,
    },
]

processos = []


# ==========================================================
# CORES
# ==========================================================

RESET = "\033[0m"
VERDE = "\033[92m"
VERMELHO = "\033[91m"
AMARELO = "\033[93m"
AZUL = "\033[96m"
CINZA = "\033[90m"
NEGRITO = "\033[1m"


# ==========================================================
# INTERFACE
# ==========================================================

def limpar_tela():
    os.system("cls" if os.name == "nt" else "clear")


def cabecalho():
    limpar_tela()

    print(AZUL + NEGRITO)
    print("╔══════════════════════════════════════════════╗")
    print("║              FINANÇA FÁCIL                   ║")
    print("║        Inicializador do Ambiente             ║")
    print("╚══════════════════════════════════════════════╝")
    print(RESET)


def separador():
    print(
        AZUL
        + "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        + RESET
    )


def sucesso(texto):
    print(f"{VERDE}✓{RESET} {texto}")


def aviso(texto):
    print(f"{AMARELO}!{RESET} {texto}")


def erro(texto):
    print(f"{VERMELHO}✗{RESET} {texto}")


# ==========================================================
# COMANDOS
# ==========================================================

def comando_existe(comando):
    return shutil.which(comando) is not None


def executar_comando(
    comando,
    pasta=None,
    mostrar_saida=True
):
    try:

        if mostrar_saida:
            resultado = subprocess.run(
                comando,
                cwd=pasta,
                shell=True
            )
        else:
            resultado = subprocess.run(
                comando,
                cwd=pasta,
                shell=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )

        return resultado.returncode == 0

    except Exception as exc:
        erro(str(exc))
        return False


def obter_versao(comando):
    try:
        resultado = subprocess.run(
            f"{comando} --version",
            shell=True,
            capture_output=True,
            text=True
        )

        if resultado.returncode == 0:
            return resultado.stdout.strip()

    except Exception:
        pass

    return "desconhecida"


# ==========================================================
# VERIFICAÇÃO DO AMBIENTE
# ==========================================================

def verificar_node():

    print()
    print(f"{NEGRITO}Verificando ambiente{RESET}")
    print()

    if not comando_existe("node"):
        erro("Node.js não foi encontrado.")
        print()
        print(
            "O Finança Fácil necessita do Node.js "
            "para executar."
        )
        return False

    sucesso(
        f"Node.js encontrado: {obter_versao('node')}"
    )

    if not comando_existe("npm"):
        erro("npm não foi encontrado.")
        return False

    sucesso(
        f"npm encontrado: {obter_versao('npm')}"
    )

    return True


def verificar_estrutura():

    print()
    print(f"{NEGRITO}Verificando estrutura do projeto{RESET}")
    print()

    tudo_ok = True

    for servico in SERVICOS:

        nome = servico["nome"]
        pasta = servico["pasta"]

        if pasta.exists():
            sucesso(f"{nome}: pasta encontrada")
        else:
            erro(
                f"{nome}: pasta não encontrada -> {pasta}"
            )
            tudo_ok = False
            continue

        package_json = pasta / "package.json"

        if package_json.exists():
            sucesso(f"{nome}: package.json encontrado")
        else:
            erro(f"{nome}: package.json não encontrado")
            tudo_ok = False

    return tudo_ok


# ==========================================================
# DEPENDÊNCIAS
# ==========================================================

def instalar_dependencias(servico):

    nome = servico["nome"]
    pasta = servico["pasta"]

    node_modules = pasta / "node_modules"

    if node_modules.exists():
        sucesso(f"{nome}: dependências já instaladas")
        return True

    aviso(
        f"{nome}: node_modules não encontrado"
    )

    lock = pasta / "package-lock.json"

    if lock.exists():
        comando = "npm ci"
    else:
        comando = "npm install"

    print()
    print(
        f"  Instalando dependências de {nome}..."
    )
    print(f"  Comando: {comando}")
    print()

    if executar_comando(
        comando,
        pasta=pasta
    ):
        sucesso(
            f"{nome}: dependências instaladas"
        )
        return True

    erro(
        f"{nome}: falha ao instalar dependências"
    )

    return False


def verificar_dependencias():

    print()
    print(f"{NEGRITO}Verificando dependências{RESET}")
    print()

    for servico in SERVICOS:

        print(f"{NEGRITO}{servico['nome']}{RESET}")

        if not instalar_dependencias(servico):
            return False

        print()

    return True


# ==========================================================
# BACKEND / PRISMA
# ==========================================================

def preparar_backend():

    backend = next(
        (
            s
            for s in SERVICOS
            if s["nome"] == "Backend"
        ),
        None
    )

    if not backend:
        return True

    pasta = backend["pasta"]

    print()
    print(f"{NEGRITO}Preparando Backend{RESET}")
    print()

    # ------------------------------------------------------
    # .ENV
    # ------------------------------------------------------

    env = pasta / ".env"

    if backend.get("env"):

        if env.exists():
            sucesso(".env encontrado")
        else:
            aviso(".env não encontrado")

            exemplo = pasta / ".env.example"

            if exemplo.exists():
                print(
                    "  Existe um .env.example, mas ele não "
                    "será copiado automaticamente."
                )

            print()
            print(
                "  Configure o .env antes de utilizar "
                "recursos que dependem dele."
            )

            return False

    # ------------------------------------------------------
    # PRISMA
    # ------------------------------------------------------

    prisma_dir = pasta / "prisma"

    if backend.get("prisma") and prisma_dir.exists():

        sucesso("Prisma detectado")

        print()
        print("  Gerando Prisma Client...")
        print()

        if executar_comando(
            "npx prisma generate",
            pasta=pasta
        ):
            sucesso("Prisma Client gerado")
        else:
            erro("Falha ao executar prisma generate")
            return False

    else:
        aviso(
            "Diretório Prisma não encontrado. "
            "Etapa ignorada."
        )

    return True


# ==========================================================
# PORTAS
# ==========================================================

def porta_aberta(porta):

    hosts = [
        "localhost",
        "127.0.0.1",
        "::1"
    ]

    for host in hosts:

        try:

            with socket.create_connection(
                (host, porta),
                timeout=1
            ):
                return True

        except OSError:
            continue

    return False


def esperar_porta(nome, porta, timeout):

    inicio = time.time()

    animacao = [
        "|",
        "/",
        "-",
        "\\"
    ]

    indice = 0

    while time.time() - inicio < timeout:

        if porta_aberta(porta):

            print(
                f"\r      {VERDE}✓ "
                f"{nome} iniciado com sucesso "
                f"na porta {porta}"
                f"{RESET}{' ' * 20}"
            )

            return True

        print(
            f"\r      {AMARELO}"
            f"{animacao[indice % len(animacao)]} "
            f"Aguardando porta {porta}..."
            f"{RESET}",
            end="",
            flush=True
        )

        indice += 1

        time.sleep(0.5)

    print()

    erro(
        f"{nome} não respondeu "
        f"na porta {porta}"
    )

    return False


# ==========================================================
# INICIALIZAÇÃO
# ==========================================================

def iniciar_servico(
    servico,
    numero,
    total
):

    nome = servico["nome"]
    pasta = servico["pasta"]
    comando = servico["comando"]
    porta = servico["porta"]
    timeout = servico["timeout"]

    print()
    print(
        f"{NEGRITO}[{numero}/{total}] "
        f"{nome}{RESET}"
    )

    print(f"      Porta   : {porta}")
    print(f"      Pasta   : {pasta}")
    print(f"      Comando : {comando}")
    print()

    # ------------------------------------------------------
    # PORTA JÁ OCUPADA
    # ------------------------------------------------------

    if porta_aberta(porta):

        aviso(
            f"Porta {porta} já está em uso."
        )

        aviso(
            f"{nome} será considerado "
            f"como já iniciado."
        )

        return True

    # ------------------------------------------------------
    # PROCESSO
    # ------------------------------------------------------

    try:

        if os.name == "nt":

            processo = subprocess.Popen(
                comando,
                cwd=pasta,
                shell=True,
                creationflags=(
                    subprocess.CREATE_NEW_PROCESS_GROUP
                )
            )

        else:

            processo = subprocess.Popen(
                comando,
                cwd=pasta,
                shell=True,
                preexec_fn=os.setsid
            )

        processos.append(
            {
                "nome": nome,
                "processo": processo
            }
        )

    except Exception as exc:

        erro(
            f"Erro ao iniciar {nome}"
        )

        print(exc)

        return False

    # ------------------------------------------------------
    # AGUARDA
    # ------------------------------------------------------

    return esperar_porta(
        nome,
        porta,
        timeout
    )


# ==========================================================
# ENCERRAMENTO
# ==========================================================

def encerrar_processos():

    if not processos:
        return

    print()
    separador()
    print()

    print(
        f"{AMARELO}"
        f"Encerrando ambiente..."
        f"{RESET}"
    )

    print()

    for item in reversed(processos):

        nome = item["nome"]
        processo = item["processo"]

        try:

            if processo.poll() is None:

                if os.name == "nt":

                    subprocess.run(
                        [
                            "taskkill",
                            "/PID",
                            str(processo.pid),
                            "/T",
                            "/F"
                        ],
                        stdout=subprocess.DEVNULL,
                        stderr=subprocess.DEVNULL
                    )

                else:

                    os.killpg(
                        os.getpgid(
                            processo.pid
                        ),
                        signal.SIGTERM
                    )

            sucesso(
                f"{nome} encerrado"
            )

        except Exception:

            erro(
                f"Não foi possível encerrar {nome}"
            )

    print()
    sucesso(
        "Ambiente Finança Fácil finalizado."
    )


# ==========================================================
# STATUS
# ==========================================================

def mostrar_status():

    print()
    print(
        VERDE
        + "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        + RESET
    )

    print()

    print(
        f"{VERDE}{NEGRITO}"
        f"✓ Ambiente iniciado com sucesso!"
        f"{RESET}"
    )

    print()

    print(
        f"  Backend  "
        f"{VERDE}● ONLINE{RESET}"
        f"   http://localhost:3000"
    )

    print(
        f"  Web      "
        f"{VERDE}● ONLINE{RESET}"
        f"   http://localhost:4200"
    )

    print(
        f"  Mobile   "
        f"{VERDE}● ONLINE{RESET}"
        f"   http://localhost:4201"
    )

    print()
    separador()
    print()

    print(
        f"{AMARELO}"
        f"Pressione CTRL+C "
        f"para encerrar tudo."
        f"{RESET}"
    )


# ==========================================================
# MAIN
# ==========================================================

def main():

    if os.name == "nt":
        os.system("")

    cabecalho()

    # ------------------------------------------------------
    # 1. NODE / NPM
    # ------------------------------------------------------

    if not verificar_node():

        print()
        erro(
            "Não foi possível preparar "
            "o ambiente."
        )

        sys.exit(1)

    # ------------------------------------------------------
    # 2. ESTRUTURA
    # ------------------------------------------------------

    if not verificar_estrutura():

        print()
        erro(
            "A estrutura do projeto "
            "está incompleta."
        )

        sys.exit(1)

    # ------------------------------------------------------
    # 3. DEPENDÊNCIAS
    # ------------------------------------------------------

    if not verificar_dependencias():

        print()
        erro(
            "Falha na preparação "
            "das dependências."
        )

        sys.exit(1)

    # ------------------------------------------------------
    # 4. BACKEND / PRISMA
    # ------------------------------------------------------

    if not preparar_backend():

        print()
        erro(
            "Falha na preparação "
            "do Backend."
        )

        sys.exit(1)

    # ------------------------------------------------------
    # 5. INICIAR SERVIÇOS
    # ------------------------------------------------------

    print()
    separador()

    print()
    print(
        f"{NEGRITO}"
        f"Iniciando serviços"
        f"{RESET}"
    )

    total = len(SERVICOS)

    for indice, servico in enumerate(
        SERVICOS,
        start=1
    ):

        sucesso_inicio = iniciar_servico(
            servico,
            indice,
            total
        )

        if not sucesso_inicio:

            print()
            erro(
                f"Inicialização interrompida "
                f"na etapa: {servico['nome']}"
            )

            encerrar_processos()

            sys.exit(1)

    # ------------------------------------------------------
    # 6. STATUS FINAL
    # ------------------------------------------------------

    mostrar_status()

    # ------------------------------------------------------
    # 7. MONITORAMENTO
    # ------------------------------------------------------

    try:

        while True:

            time.sleep(1)

            for item in processos:

                processo = item["processo"]

                if processo.poll() is not None:

                    print()

                    erro(
                        f"{item['nome']} foi encerrado "
                        f"inesperadamente."
                    )

                    encerrar_processos()

                    sys.exit(1)

    except KeyboardInterrupt:

        encerrar_processos()


if __name__ == "__main__":
    main()