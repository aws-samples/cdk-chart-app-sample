ARG VARIANT="jammy"
FROM mcr.microsoft.com/vscode/devcontainers/base:0-${VARIANT}

RUN wget https://go.dev/dl/go1.18.1.linux-amd64.tar.gz \
    && rm -rf /usr/local/go \
    && sudo tar -C /usr/local -xzf go1.18.1.linux-amd64.tar.gz \
    && rm -f go1.18.1.linux-amd64.tar.gz