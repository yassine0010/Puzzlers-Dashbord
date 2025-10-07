pipeline {
    agent any
    tools {
        nodejs  'nodejs'
    }
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code...'
                checkout scm
            }
        }
     /*   stage('Restore NPM cache') {
            steps {
                echo 'Restoring NPM cache...'
                dir ("{$env.WORKSPACE}") {
                    cache(maxCacheSize: 1, caches: [[path : '.npm']]) {
                        echo 'NPM cache restored'
                    }
                }
            }
        }*/
        stage("install dependencies") {
            steps {
                echo 'Installing dependencies...'
              //  sh 'npm ci --cache .npm'
                sh 'npm ci'
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
                sh 'npx ng test --watch=false --browsers=ChromeHeadlessCI'
            }
        }

    }
}
