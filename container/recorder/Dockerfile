FROM public.ecr.aws/docker/library/golang:1.18 AS builder
WORKDIR /myapp
COPY . /myapp
RUN go env -w GOPROXY=direct \
&&  CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -o recorder main.go

FROM public.ecr.aws/docker/library/alpine:3.15
WORKDIR /myapp
RUN adduser -D -H -s /bin/false myuser \
&&  chown -R myuser /myapp \
&&  apk --no-cache add ca-certificates
COPY --from=builder /myapp/recorder .
USER myuser
ENTRYPOINT ["/myapp/recorder"]
