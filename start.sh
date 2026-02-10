#!/bin/bash

# LogicAI-N8N - Script de démarrage rapide pour Linux/macOS
# Ce script automatisé configure et démarre l'application complète

set -e

# Couleurs pour une meilleure lisibilité
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

echo -e "${CYAN}===================================="
echo -e "LogicAI-N8N - Installation Rapide"
echo -e "====================================${NC}"
echo ""

# Vérifier si Docker est installé
echo -e "${YELLOW}🔍 Vérification de Docker...${NC}"
if command -v docker &> /dev/null; then
    docker_version=$(docker --version)
    echo -e "${GREEN}✅ $docker_version${NC}"
else
    echo -e "${RED}❌ Docker n'est pas installé${NC}"
    echo -e "${YELLOW}Veuillez installer Docker:${NC}"
    echo -e "  Ubuntu/Debian: curl -fsSL https://get.docker.com | sh"
    echo -e "  macOS: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Vérifier si Docker Compose est disponible
echo -e "${YELLOW}🔍 Vérification de Docker Compose...${NC}"
if docker compose version &> /dev/null; then
    compose_version=$(docker compose version)
    echo -e "${GREEN}✅ $compose_version${NC}"
elif command -v docker-compose &> /dev/null; then
    compose_version=$(docker-compose --version)
    echo -e "${GREEN}✅ $compose_version${NC}"
else
    echo -e "${RED}❌ Docker Compose n'est pas disponible${NC}"
    exit 1
fi

echo ""

# Créer le fichier .env s'il n'existe pas
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}🔧 Configuration des variables d'environnement...${NC}"

    # Générer une clé de chiffrement aléatoire (64 caractères hexadécimaux)
    encryption_key=$(openssl rand -hex 32)

    # Créer le fichier .env
    cat > .env << EOF
ENCRYPTION_KEY="$encryption_key"
CORS_ORIGIN="http://localhost"
EOF

    echo -e "${GREEN}✅ Fichier .env créé avec une clé de chiffrement sécurisée${NC}"
    echo ""
else
    echo -e "${GREEN}✅ Fichier .env déjà existant${NC}"
    echo ""
fi

# Créer le dossier data s'il n'existe pas
if [ ! -d "data" ]; then
    echo -e "${YELLOW}📁 Création du dossier data...${NC}"
    mkdir -p data
    echo -e "${GREEN}✅ Dossier data créé${NC}"
    echo ""
fi

# Construire les images Docker
echo -e "${YELLOW}🔨 Construction des images Docker (cela peut prendre quelques minutes)...${NC}"
echo -e "${CYAN}→ Backend + Frontend${NC}"

if docker compose build &> /dev/null; then
    echo -e "${GREEN}✅ Images construites avec succès${NC}"
elif docker-compose build &> /dev/null; then
    echo -e "${GREEN}✅ Images construites avec succès${NC}"
else
    echo -e "${RED}❌ Erreur lors de la construction des images${NC}"
    exit 1
fi

echo ""

# Démarrer les containers
echo -e "${YELLOW}🚀 Démarrage de LogicAI-N8N...${NC}"

if docker compose up -d 2>&1; then
    :
elif docker-compose up -d 2>&1; then
    :
else
    echo -e "${RED}❌ Erreur lors du démarrage${NC}"

    # Vérifier si c'est un problème de port
    if netstat -tuln 2>/dev/null | grep -q ":3001 " || \
       lsof -i :3001 &> /dev/null || \
       netstat -an | grep -q "\.3001 "; then
        echo ""
        echo -e "${YELLOW}⚠️  Le port 3001 est déjà utilisé${NC}"
        echo -e "${WHITE}Veuillez arrêter le service qui utilise ce port:${NC}"
        echo -e "${GRAY}  sudo lsof -ti:3001 | xargs kill -9${NC}"
        echo ""
        echo -e "${YELLOW}Ou modifiez les ports dans docker-compose.yml${NC}"
    fi

    if netstat -tuln 2>/dev/null | grep -q ":5174 " || \
       lsof -i :5174 &> /dev/null 2>&1 || \
       netstat -an | grep -q "\.5174 "; then
        echo ""
        echo -e "${YELLOW}⚠️  Le port 5174 est déjà utilisé${NC}"
        echo -e "${WHITE}Veuillez arrêter le service qui utilise ce port:${NC}"
        echo -e "${GRAY}  sudo lsof -ti:5174 | xargs kill -9${NC}"
        echo ""
        echo -e "${YELLOW}Ou modifiez les ports dans docker-compose.yml${NC}"
    fi

    exit 1
fi

echo -e "${GREEN}✅ LogicAI-N8N démarré avec succès${NC}"
echo ""

# Attendre quelques secondes que les services démarrent
echo -e "${YELLOW}⏳ Initialisation des services...${NC}"
sleep 5

# Vérifier l'état des containers
echo -e "${YELLOW}📊 État des services:${NC}"
if docker compose ps &> /dev/null; then
    docker compose ps
elif docker-compose ps &> /dev/null; then
    docker-compose ps
fi
echo ""

# Afficher les informations d'accès
echo -e "${CYAN}===================================="
echo -e "${GREEN}✨ LogicAI-N8N est prêt !${NC}"
echo -e "${CYAN}====================================${NC}"
echo ""
echo -e "${WHITE}🌐 Interface Web:${NC}"
echo -e "${CYAN}   http://localhost:5174${NC}"
echo ""
echo -e "${WHITE}🔧 Backend API:${NC}"
echo -e "${CYAN}   http://localhost:3001${NC}"
echo ""
echo -e "${WHITE}📚 Documentation:${NC}"
echo -e "${GRAY}   Consultez DOCKER_SETUP.md pour plus d'informations${NC}"
echo ""
echo -e "${WHITE}📝 Commandes utiles:${NC}"
echo -e "${GRAY}   Voir les logs: docker compose logs -f${NC}"
echo -e "${GRAY}   Arrêter:      docker compose down${NC}"
echo -e "${GRAY}   Redémarrer:   docker compose restart${NC}"
echo ""

# Demander si l'utilisateur veut ouvrir le navigateur
read -p "Ouvrir le navigateur web? (O/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    # Détecter l'OS et ouvrir le navigateur approprié
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        open http://localhost:5174
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v xdg-open &> /dev/null; then
            xdg-open http://localhost:5174
        elif command -v firefox &> /dev/null; then
            firefox http://localhost:5174 &
        elif command -v google-chrome &> /dev/null; then
            google-chrome http://localhost:5174 &
        else
            echo -e "${YELLOW}Impossible d'ouvrir le navigateur automatiquement${NC}"
        fi
    fi
fi

echo ""
echo -e "${GRAY}Appuyez sur Entrée pour quitter...${NC}"
read
