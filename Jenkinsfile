pipeline {
    agent any

    environment {
        DOCKER_HUB_USER = 'nathandev'
        DOCKER_HUB_REPO = 'kora-backend'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        KUBECONFIG = credentials('kubeconfig-credential')
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
                    bat "docker build -t ${DOCKER_HUB_USER}/${DOCKER_HUB_REPO}:${IMAGE_TAG} ."
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                script {
                    docker.withRegistry('', 'docker-hub-credentials') {
                        bat "docker push ${DOCKER_HUB_USER}/${DOCKER_HUB_REPO}:${IMAGE_TAG}"
                        bat "docker tag ${DOCKER_HUB_USER}/${DOCKER_HUB_REPO}:${IMAGE_TAG} ${DOCKER_HUB_USER}/${DOCKER_HUB_REPO}:latest"
                        bat "docker push ${DOCKER_HUB_USER}/${DOCKER_HUB_REPO}:latest"
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                dir('k8s') {
                    // Update the image tag using PowerShell since sed is not standard on Windows
                    powershell "((Get-Content backend-deployment.yaml) -replace 'kora-backend:latest', '${DOCKER_HUB_USER}/${DOCKER_HUB_REPO}:${IMAGE_TAG}') | Set-Content backend-deployment.yaml"
                    
                    bat 'kubectl apply -f .'
                    bat "kubectl rollout status deployment/kora-backend --timeout=120s"
                }
            }
        }
    }
}