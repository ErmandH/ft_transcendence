USER = $(shell whoami)

all: start

clean:
	sudo docker compose down --rmi all -v --remove-orphans

fclean: clean
	sudo rm -rf /home/$(USER)/devdb
	sudo docker system prune --volumes --all --force
	sudo docker network prune --force
	sudo docker volume prune --force

re: fclean all

start:
	sudo mkdir -p /home/$(USER)/devdb
	sudo docker-compose up -d --build

stop:
	sudo docker-compose stop

restart:
	sudo docker-compose restart

down:
	sudo docker-compose down

ps:
	sudo docker-compose ps

logs:
	sudo docker-compose logs -f

.PHONY: all clean fclean re start stop down restart ps logs
