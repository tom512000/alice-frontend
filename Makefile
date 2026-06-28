.PHONY: install dev build preview typecheck lint format clean docker-build docker-up docker-down

install:
	npm install

dev:
	npm run dev

build:
	npm run build

preview:
	npm run preview

typecheck:
	npm run typecheck

lint:
	npm run lint

format:
	npm run format

clean:
	rm -rf dist node_modules

docker-build:
	docker build -t alice-frontend .

docker-up:
	docker compose up -d

docker-down:
	docker compose down

## Dev with env
env:
	cp .env.example .env
	@echo ".env créé. Modifiez VITE_API_BASE_URL si nécessaire."
