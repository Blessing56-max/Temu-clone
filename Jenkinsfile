pipeline {
    agent any

    environment {
        DOCKER_HUB_USER = 'nathandev'
        DOCKER_HUB_REPO = 'kora-backend'
        KUBECONFIG = credentials('kubeconfig-credential')
        
        DOCKER_DIR = 'C:\\Users\\pc\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin'
        DOCKER_CMD = "${DOCKER_DIR}\\docker.exe"
        KUBECTL_CMD = "${DOCKER_DIR}\\kubectl.exe"
        
        PATH = "${DOCKER_DIR};${env.PATH}"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/Blessing56-max/Temu-clone.git'
            }
        }

        stage('Build Backend JAR') {
            steps {
                dir('backend') {
                    bat 'mvn clean package -DskipTests'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                dir('backend') {
                    // Build it directly as latest
                    bat "\"${env.DOCKER_CMD}\" build -t ${DOCKER_HUB_USER}/${DOCKER_HUB_REPO}:latest ."
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                dir('k8s') {
                    // Apply the k8s files
                    bat "\"${env.KUBECTL_CMD}\" apply -f ."
                    // Force a rollout restart so K8s picks up the newly built local image
                    bat "\"${env.KUBECTL_CMD}\" rollout restart deployment/kora-backend"
                    bat "\"${env.KUBECTL_CMD}\" rollout status deployment/kora-backend --timeout=120s"
                }
            }
        }
    }
}