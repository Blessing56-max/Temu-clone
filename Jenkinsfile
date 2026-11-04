pipeline {
    agent any

    environment {
        DOCKER_HUB_USER = 'your-dockerhub-username' // Change this later
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
                    sh 'mvn clean package -DskipTests'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                dir('backend') {
                    sh "docker build -t ${DOCKER_HUB_USER}/${DOCKER_HUB_REPO}:${IMAGE_TAG} ."
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                script {
                    docker.withRegistry('', 'docker-hub-credentials') {
                        sh "docker push ${DOCKER_HUB_USER}/${DOCKER_HUB_REPO}:${IMAGE_TAG}"
                        sh "docker tag ${DOCKER_HUB_USER}/${DOCKER_HUB_REPO}:${IMAGE_TAG} ${DOCKER_HUB_USER}/${DOCKER_HUB_REPO}:latest"
                        sh "docker push ${DOCKER_HUB_USER}/${DOCKER_HUB_REPO}:latest"
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                dir('k8s') {
                    sh "sed -i 's|kora-backend:latest|${DOCKER_HUB_USER}/${DOCKER_HUB_REPO}:${IMAGE_TAG}|g' backend-deployment.yaml"
                    sh 'kubectl apply -f .'
                    sh "kubectl rollout status deployment/kora-backend --timeout=120s"
                }
            }
        }
    }
}