pipeline {
    agent any
    tools {
        nodejs  'nodejs' //'nodejs' heya el enviroment path
    }
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code...'
                checkout scm
            }
        }

        stage("install dependencies") {
            steps {
                echo 'Installing dependencies...'
              //  sh 'npm ci --cache .npm'
                sh 'npm ci --prefer-offline'
            }
        }
        stage('Build') {
            steps {
                echo 'Building...'
                sh 'npx ng build'
            }
        }
        stage('Test') {
            steps {
                echo 'Testing...'
                sh 'npx ng test '
            }
        }

    }
}
