#!/bin/bash

set -e

show_help() {
    cat << EOF
Usage: $0 [COMMAND] [OPTIONS]

Commands:
  list                           List all LogicAI-N8N instances
  remove <instance-name>          Remove an instance
  logs <instance-name>            Show logs for an instance
  stop <instance-name>            Stop an instance
  start <instance-name>           Start a stopped instance
  restart <instance-name>         Restart an instance
  exec <instance-name>            Execute shell in instance
  prune                          Remove all stopped instances

Examples:
  $0 list
  $0 remove client1
  $0 logs client1
  $0 prune

EOF
}

list_instances() {
    echo "📋 LogicAI-N8N Instances"
    echo "======================"
    echo ""

    # Get all LogicAI containers
    containers=$(docker ps -a --filter "name=logic-" --format '{{.Names}}')

    if [ -z "$containers" ]; then
        echo "No instances found"
        return
    fi

    for container in $containers; do
        # Get container status
        status=$(docker inspect -f '{{.State.Status}}' $container 2>/dev/null)

        # Get port mapping
        port=$(docker port $container 2>/dev/null | grep '0.0.0.0' | cut -d':' -f2 | head -1)
        [ -z "$port" ] && port="-"

        # Get instance info
        instance_id=$(docker inspect -f '{{.Config.Env}}' $container 2>/dev/null | grep -o 'INSTANCE_ID=[^ ]*' | cut -d'=' -f2)
        instance_name=$(docker inspect -f '{{.Config.Env}}' $container 2>/dev/null | grep -o 'INSTANCE_NAME=[^ ]*' | cut -d'=' -f2)

        # Get volume
        volume=$(docker inspect -f '{{.Mounts}}' $container 2>/dev/null | grep -o '"Name":"[^"]*"' | cut -d'"' -f4)
        [ -z "$volume" ] && volume="-"

        # Display
        if [ "$status" = "running" ]; then
            echo "✅ $container"
        else
            echo "⏸️  $container (stopped)"
        fi
        echo "   ID:       ${instance_id:-unknown}"
        echo "   Name:     ${instance_name:-unknown}"
        echo "   Port:     $port"
        echo "   Volume:   $volume"
        echo ""
    done
}

remove_instance() {
    local instance_name=$1

    if [ -z "$instance_name" ]; then
        echo "Error: Instance name required"
        exit 1
    fi

    # Check if container exists
    if ! docker ps -a --format '{{.Names}}' | grep -q "^${instance_name}$"; then
        echo "❌ Error: Instance '$instance_name' not found"
        exit 1
    fi

    echo "🗑️  Removing instance: $instance_name"

    # Stop and remove container
    docker stop $instance_name 2>/dev/null || true
    docker rm -f $instance_name

    # Ask about volume
    volume="${instance_name}-data"
    if docker volume ls -q | grep -q "^${volume}$"; then
        echo ""
        read -p "Remove volume '$volume' as well? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker volume rm $volume
            echo "✅ Volume removed"
        else
            echo "ℹ️  Volume preserved"
        fi
    fi

    echo "✅ Instance removed"
}

show_logs() {
    local instance_name=$1

    if [ -z "$instance_name" ]; then
        echo "Error: Instance name required"
        exit 1
    fi

    docker logs -f $instance_name
}

stop_instance() {
    local instance_name=$1

    if [ -z "$instance_name" ]; then
        echo "Error: Instance name required"
        exit 1
    fi

    echo "⏸️  Stopping instance: $instance_name"
    docker stop $instance_name
    echo "✅ Instance stopped"
}

start_instance() {
    local instance_name=$1

    if [ -z "$instance_name" ]; then
        echo "Error: Instance name required"
        exit 1
    fi

    echo "▶️  Starting instance: $instance_name"
    docker start $instance_name
    echo "✅ Instance started"
}

restart_instance() {
    local instance_name=$1

    if [ -z "$instance_name" ]; then
        echo "Error: Instance name required"
        exit 1
    fi

    echo "🔄 Restarting instance: $instance_name"
    docker restart $instance_name
    echo "✅ Instance restarted"
}

exec_shell() {
    local instance_name=$1

    if [ -z "$instance_name" ]; then
        echo "Error: Instance name required"
        exit 1
    fi

    docker exec -it $instance_name sh
}

prune_instances() {
    echo "🧹 Removing all stopped LogicAI-N8N instances..."

    # Get all stopped LogicAI containers
    stopped=$(docker ps -a --filter "name=logic-" --filter "status=exited" --format '{{.Names}}')

    if [ -z "$stopped" ]; then
        echo "No stopped instances found"
        return
    fi

    for container in $stopped; do
        echo "Removing: $container"
        docker rm -f $container > /dev/null 2>&1
    done

    echo "✅ Pruned stopped instances"
}

# Parse command
case "${1:-}" in
    list)
        list_instances
        ;;
    remove)
        remove_instance "$2"
        ;;
    logs)
        show_logs "$2"
        ;;
    stop)
        stop_instance "$2"
        ;;
    start)
        start_instance "$2"
        ;;
    restart)
        restart_instance "$2"
        ;;
    exec)
        exec_shell "$2"
        ;;
    prune)
        prune_instances
        ;;
    *)
        show_help
        exit 1
        ;;
esac
