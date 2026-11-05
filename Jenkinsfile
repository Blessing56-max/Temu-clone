pipeline {
    agent any

    environment {
        DOCKER_HUB_USER = 'nathandev'
        DOCKER_HUB_REPO = 'kora-backend'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        KUBECONFIG = credentials('kubeconfig-credential')
        
        // The exact path to your custom Docker installation
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
                    bat "\"${env.DOCKER_CMD}\" build -t ${DOCKER_HUB_USER}/${DOCKER_HUB_REPO}:${IMAGE_TAG} ."
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                // WE BYPASS THE BROKEN PLUGIN AND USE THE DOCKER CMD DIRECTLY
                withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER')]) {
                    dir('backend') {
                        bat "\"${env.DOCKER_CMD}\" login -u %DOCKER_USER% -p %DOCKER_PASS%"
                        bat "\"${env.DOCKER_CMD}\" push ${DOCKER_HUB_USER}/${DOCKER_HUB_REPO}:${IMAGE_TAG}"
                        bat "\"${env.DOCKER_CMD}\" tag ${DOCKER_HUB_USER}/${DOCKER_HUB_REPO}:${IMAGE_TAG} ${DOCKER_HUB_USER}/${DOCKER_HUB_REPO}:latest"
                        bat "\"${env.DOCKER_CMD}\" push ${DOCKER_HUB_USER}/${DOCKER_HUB_REPO}:latest"
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                dir('k8s') {
                    powershell "((Get-Content backend-deployment.yaml) -replace 'kora-backend:latest', '${DOCKER_HUB_USER}/${DOCKER_HUB_REPO}:${IMAGE_TAG}') | Set-Content backend-deployment.yaml"
                    bat "\"${env.KUBECTL_CMD}\" apply -f ."
                    bat "\"${env.KUBECTL_CMD}\" rollout status deployment/kora-backend --timeout=120s"
                }
            }
        }
    }
}