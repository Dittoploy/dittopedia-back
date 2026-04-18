pipeline {
  agent {
    label 'worker1'
  }

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  environment {
    DOCKER_IMAGE = 'dvnpn/dittopedia-back'
    DOCKER_CREDENTIALS_ID = 'dockerhub-creds'
    AWS_CREDENTIALS_ID = 'aws-deploy-creds'
    SSH_INGRESS_CIDR_CREDENTIALS_ID = 'ssh-ingress-cidr-default'
    INFRA_REPO_URL = 'https://github.com/Dittoploy/dittopedia-infra.git'
    INFRA_REPO_BRANCH = 'staging-aws-1'
    SONARQUBE_ENV = 'sonarqube'
    SONAR_PROJECT_KEY = 'dittopedia-back'
    SONAR_PROJECT_NAME = 'dittopedia-back'
    AWS_REGION = 'eu-west-3'
    WORKER_DEPLOY_KEY_PATH = '/var/jenkins/.ssh/dittopedia_deploy_key.pem'
    SSH_INGRESS_CIDR_EFFECTIVE = ''
  }

  stages {
    stage('Resolve SSH ingress CIDR') {
      when {
        expression {
          def branchName = env.BRANCH_NAME ?: ''
          def gitBranch = env.GIT_BRANCH ?: ''
          return branchName == 'staging-aws-1' || gitBranch == 'staging-aws-1' || gitBranch == 'origin/staging-aws-1' || gitBranch == 'refs/remotes/origin/staging-aws-1' || gitBranch.endsWith('/staging-aws-1')
        }
      }
      steps {
        script {
          def resolvedCidr = ''

          withCredentials([string(credentialsId: "${SSH_INGRESS_CIDR_CREDENTIALS_ID}", variable: 'SSH_INGRESS_CIDR_DEFAULT')]) {
            def defaultCidr = env.SSH_INGRESS_CIDR_DEFAULT?.trim()
            resolvedCidr = defaultCidr ?: ''
            echo "Credential default CIDR present: ${defaultCidr ? 'yes' : 'no'}"
          }

          if (!resolvedCidr) {
            error('Credential ssh-ingress-cidr-default is empty or unavailable. Set a valid CIDR (for example x.x.x.x/32).')
          }

          writeFile file: '.ssh_ingress_cidr', text: "${resolvedCidr}\n"
          env.SSH_INGRESS_CIDR_EFFECTIVE = resolvedCidr

          echo 'SSH ingress CIDR resolved from Jenkins credential default.'
        }
      }
    }

    stage('Validate SSH ingress CIDR') {
      when {
        expression {
          def branchName = env.BRANCH_NAME ?: ''
          def gitBranch = env.GIT_BRANCH ?: ''
          return branchName == 'staging-aws-1' || gitBranch == 'staging-aws-1' || gitBranch == 'origin/staging-aws-1' || gitBranch == 'refs/remotes/origin/staging-aws-1' || gitBranch.endsWith('/staging-aws-1')
        }
      }
      steps {
        script {
          def cidr = readFile('.ssh_ingress_cidr').trim()
          if (cidr == '0.0.0.0/0') {
            error('SSH_INGRESS_CIDR must not be 0.0.0.0/0. Restrict SSH access to a trusted source CIDR.')
          }
        }
      }
    }

    stage('Install') {
      steps {
        sh '''
          node -v
          if command -v bun >/dev/null 2>&1; then bun -v; fi

          NODE_MAJOR=$(node -p "process.versions.node.split('.')[0]")
          if [ "$NODE_MAJOR" -lt 18 ]; then
            echo "Node.js >= 18 is required for NestJS (current: $(node -v))" >&2
            exit 1
          fi

          if [ -x /usr/local/bin/bun ]; then
            BUN_CMD=/usr/local/bin/bun
          elif command -v bun >/dev/null 2>&1; then
            BUN_CMD=bun
          else
            echo "Bun is required to install dependencies reproducibly because this repository uses bun.lock. Please install Bun on the Jenkins agent." >&2
            exit 1
          fi

          "$BUN_CMD" install --frozen-lockfile
        '''
      }
    }

    stage('Prisma Generate') {
      steps {
        sh '''
          if [ -x /usr/local/bin/bun ]; then
            /usr/local/bin/bun run prisma:generate
          elif command -v bun >/dev/null 2>&1; then
            bun run prisma:generate
          else
            npm run prisma:generate
          fi
        '''
      }
    }

    stage('Lint') {
      steps {
        sh '''
          if [ -x /usr/local/bin/bun ]; then
            /usr/local/bin/bun run lint
          elif command -v bun >/dev/null 2>&1; then
            bun run lint
          else
            npm run lint
          fi
        '''
      }
    }

    stage('Test') {
      steps {
        sh '''
          if [ -x /usr/local/bin/bun ]; then
            /usr/local/bin/bun run test
            /usr/local/bin/bun run test:e2e
          elif command -v bun >/dev/null 2>&1; then
            bun run test
            bun run test:e2e
          else
            npm run test
            npm run test:e2e
          fi
        '''
      }
    }

    stage('Coverage') {
      steps {
        sh '''
          if [ -x /usr/local/bin/bun ]; then
            /usr/local/bin/bun run test:cov
          elif command -v bun >/dev/null 2>&1; then
            bun run test:cov
          else
            npm run test:cov
          fi
        '''
      }
    }

    stage('Build') {
      steps {
        sh '''
          if [ -x /usr/local/bin/bun ]; then
            /usr/local/bin/bun run build
          elif command -v bun >/dev/null 2>&1; then
            bun run build
          elif [ -x /usr/bin/npm ]; then
            /usr/bin/npm run build
          else
            npm run build
          fi
        '''
      }
    }

    stage('SonarQube Analysis') {
      // TODO: Enable when SonarQube plugin is installed on Jenkins
      when {
        expression {
          return false
        }
      }
      steps {
        echo "ℹ️  SonarQube Analysis is disabled. To enable, install the SonarQube plugin in Jenkins."
      }
    }

    stage('Quality Gate') {
      // TODO: Enable when SonarQube plugin is installed on Jenkins
      when {
        expression {
          return false
        }
      }
      steps {
        echo "ℹ️  Quality Gate is disabled. To enable, install the SonarQube plugin in Jenkins."
      }
    }

    stage('Docker Build') {
      steps {
        script {
          def branchName = env.BRANCH_NAME ?: ''
          def gitBranch = env.GIT_BRANCH ?: ''

          if (branchName == 'main' || gitBranch == 'origin/main') {
            env.IMAGE_TAG = 'latest'
          } else if (branchName == 'staging-aws-1' || gitBranch == 'staging-aws-1' || gitBranch == 'origin/staging-aws-1' || gitBranch == 'refs/remotes/origin/staging-aws-1' || gitBranch.endsWith('/staging-aws-1')) {
            env.IMAGE_TAG = 'staging-aws-1'
          } else {
            env.IMAGE_TAG = env.BUILD_NUMBER
          }
        }
        sh 'docker build -t ${DOCKER_IMAGE}:${IMAGE_TAG} .'
      }
    }

    stage('Docker Push') {
      when {
        expression {
          def branchName = env.BRANCH_NAME ?: ''
          def gitBranch = env.GIT_BRANCH ?: ''
          return branchName == 'main' || branchName == 'staging-aws-1' || gitBranch == 'origin/main' || gitBranch == 'staging-aws-1' || gitBranch == 'origin/staging-aws-1' || gitBranch == 'refs/remotes/origin/staging-aws-1' || gitBranch.endsWith('/staging-aws-1')
        }
      }
      steps {
        withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDENTIALS_ID}", usernameVariable: 'DOCKERHUB_USERNAME', passwordVariable: 'DOCKERHUB_TOKEN')]) {
          sh '''
            FULL_IMAGE="${DOCKER_IMAGE}:${IMAGE_TAG}"
            echo "$DOCKERHUB_TOKEN" | docker login -u "$DOCKERHUB_USERNAME" --password-stdin
            docker tag ${DOCKER_IMAGE}:${IMAGE_TAG} "$FULL_IMAGE"
            docker push "$FULL_IMAGE"
            echo "✓ Pushed: $FULL_IMAGE"
            docker logout
          '''
        }
      }
    }

    stage('AWS Deploy to Staging') {
      when {
        expression {
          def branchName = env.BRANCH_NAME ?: ''
          def gitBranch = env.GIT_BRANCH ?: ''
          return branchName == 'staging-aws-1' || gitBranch == 'staging-aws-1' || gitBranch == 'origin/staging-aws-1' || gitBranch == 'refs/remotes/origin/staging-aws-1' || gitBranch.endsWith('/staging-aws-1')
        }
      }
      steps {
        script {
          echo "🚀 Starting AWS deployment to staging..."
          
          withCredentials([
            usernamePassword(credentialsId: "${DOCKER_CREDENTIALS_ID}", usernameVariable: 'DOCKERHUB_USERNAME', passwordVariable: 'DOCKERHUB_TOKEN'),
            usernamePassword(credentialsId: 'aws-deploy-creds', usernameVariable: 'AWS_ACCESS_KEY_ID', passwordVariable: 'AWS_SECRET_ACCESS_KEY'),
            string(credentialsId: 'ssh-ingress-cidr-default', variable: 'SSH_INGRESS_CIDR'),
            string(credentialsId: 'dittopedia-rds-password', variable: 'RDS_PASSWORD')
          ]) {
            sh '''
              set -eu

              # ====== Step 1: Prepare Environment ======
              echo "📋 Step 1: Preparing environment..."
              export AWS_REGION="$AWS_REGION"
              export BACKEND_IMAGE="$DOCKER_IMAGE:$IMAGE_TAG"

              SSH_INGRESS_CIDR_EFFECTIVE="$(tr -d '\r\n' < "${WORKSPACE}/.ssh_ingress_cidr")"
              if [ -z "${SSH_INGRESS_CIDR_EFFECTIVE}" ]; then
                echo "❌ Missing resolved SSH ingress CIDR in ${WORKSPACE}/.ssh_ingress_cidr" >&2
                exit 1
              fi
              
              # Extract SSH public key from private key
              DEPLOY_SSH_KEY_FILE="$WORKER_DEPLOY_KEY_PATH"
              PUBKEY_FILE="$(mktemp)"
              KNOWN_HOSTS_FILE="$(mktemp)"
              ANSIBLE_EXTRA_VARS_FILE=""
              trap 'rm -f "${PUBKEY_FILE}" "${KNOWN_HOSTS_FILE}" "${ANSIBLE_EXTRA_VARS_FILE:-}"' EXIT
              
              if [ ! -f "${DEPLOY_SSH_KEY_FILE}" ]; then
                echo "❌ Missing SSH key: ${DEPLOY_SSH_KEY_FILE}" >&2
                exit 1
              fi
              
              chmod 600 "${DEPLOY_SSH_KEY_FILE}" || true
              if ! ssh-keygen -y -f "${DEPLOY_SSH_KEY_FILE}" > "${PUBKEY_FILE}" 2>/dev/null; then
                echo "❌ Invalid SSH key at ${DEPLOY_SSH_KEY_FILE}" >&2
                exit 1
              fi
              
              SSH_PUBLIC_KEY="$(cat ${PUBKEY_FILE})"
              if [ -z "${SSH_PUBLIC_KEY}" ]; then
                echo "❌ Failed to extract SSH public key" >&2
                exit 1
              fi
              echo "✅ SSH public key extracted from ${DEPLOY_SSH_KEY_FILE}"
              
              # Verify Docker Hub credentials
              echo "🔐 Authenticating with Docker Hub..."
              echo "$DOCKERHUB_TOKEN" | docker login -u "$DOCKERHUB_USERNAME" --password-stdin
              
              # ====== Step 2: Clone Infra Repo ======
              echo "📦 Step 2: Cloning infrastructure repository..."
              if [ -d "infra-workdir/.git" ]; then
                cd infra-workdir
                git fetch origin "$INFRA_REPO_BRANCH"
                git checkout -B "$INFRA_REPO_BRANCH" "origin/$INFRA_REPO_BRANCH"
                cd ..
              else
                rm -rf infra-workdir
                git clone --depth 1 --branch "$INFRA_REPO_BRANCH" "$INFRA_REPO_URL" infra-workdir
              fi

              TERRAFORM_DIR="infra-workdir/apps/backend-aws/terraform"
              ANSIBLE_DIR="infra-workdir/apps/backend-aws/ansible"
              if [ ! -d "$TERRAFORM_DIR" ] || [ ! -d "$ANSIBLE_DIR" ]; then
                echo "❌ Missing expected backend-aws deploy directories in infra repository." >&2
                echo "Expected: $TERRAFORM_DIR and $ANSIBLE_DIR" >&2
                find infra-workdir -maxdepth 4 -type d | sed -n '1,120p' >&2
                exit 1
              fi
              
              cd "$TERRAFORM_DIR"
              
              # ====== Step 3: Terraform Apply ======
              echo "🏗️  Step 3: Applying Terraform configuration..."
              terraform init -input=false
              terraform apply -auto-approve -input=false \
                -var="aws_region=$AWS_REGION" \
                -var="ssh_ingress_cidr=$SSH_INGRESS_CIDR_EFFECTIVE" \
                -var="enable_rds=true" \
                -var="rds_master_password=$RDS_PASSWORD" \
                -var="public_key=$SSH_PUBLIC_KEY"
              
              # ====== Step 4: Retrieve Terraform Outputs ======
              echo "📊 Step 4: Retrieving deployment outputs..."
              BACKEND_PUBLIC_IP="$(terraform output -raw backend_public_ip 2>/dev/null || echo '')"
              BACKEND_INSTANCE_ID="$(terraform output -raw backend_instance_id 2>/dev/null || echo '')"
              RDS_ENDPOINT="$(terraform output -raw rds_endpoint 2>/dev/null | grep -v 'N/A' || echo '')"
              
              if [ -z "${BACKEND_PUBLIC_IP}" ]; then
                echo "❌ Failed to retrieve backend public IP from Terraform"
                exit 1
              fi
              
              echo "✓ Backend Instance ID: ${BACKEND_INSTANCE_ID}"
              echo "✓ Backend Public IP: ${BACKEND_PUBLIC_IP}"
              echo "✓ RDS Endpoint: ${RDS_ENDPOINT}"
              
              # ====== Step 5: SSH Health Check ======
              echo "🔍 Step 5: Checking SSH connectivity..."
              SSH_KEY_PATH="$DEPLOY_SSH_KEY_FILE"
              MAX_RETRIES=12
              RETRY_DELAY=10
              RETRY_COUNT=0
              
              while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
                if ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=accept-new -o UserKnownHostsFile="$KNOWN_HOSTS_FILE" \
                    -i "${SSH_KEY_PATH}" ubuntu@"${BACKEND_PUBLIC_IP}" "echo 'SSH OK'" >/dev/null 2>&1; then
                  echo "✓ SSH connectivity verified"
                  break
                fi
                RETRY_COUNT=$((RETRY_COUNT + 1))
                echo "⏳ SSH retry ${RETRY_COUNT}/${MAX_RETRIES}... (waiting ${RETRY_DELAY}s)"
                sleep ${RETRY_DELAY}
              done
              
              if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
                echo "❌ SSH connectivity timeout after ${MAX_RETRIES} retries"
                exit 1
              fi
              
              # ====== Step 6: Generate Ansible Inventory ======
              echo "📝 Step 6: Generating Ansible inventory..."
              cd "${WORKSPACE}/${ANSIBLE_DIR}"
              
              cat > hosts.ini <<EOF
[backend]
${BACKEND_PUBLIC_IP} ansible_user=ubuntu ansible_ssh_private_key_file=${SSH_KEY_PATH} ansible_ssh_common_args="-o StrictHostKeyChecking=no"
EOF

              umask 077
              ANSIBLE_EXTRA_VARS_FILE="$(mktemp)"
              if [ -n "${RDS_ENDPOINT}" ]; then
                DATABASE_URL="postgresql://postgres:${RDS_PASSWORD}@${RDS_ENDPOINT}/dittopedia"
              else
                DATABASE_URL="postgresql://postgres:${RDS_PASSWORD}@localhost:5432/dittopedia"
              fi

              cat > "$ANSIBLE_EXTRA_VARS_FILE" <<EOF
backend_image: "$BACKEND_IMAGE"
dockerhub_user: "$DOCKERHUB_USERNAME"
dockerhub_password: "$DOCKERHUB_TOKEN"
database_url: "$DATABASE_URL"
EOF
              
              echo "✓ Ansible inventory created"
              cat hosts.ini
              
              # ====== Step 7: Run Ansible Playbook ======
              echo "🤖 Step 7: Running Ansible deployment..."
              ansible-playbook -i hosts.ini site.yml \
                --extra-vars "@$ANSIBLE_EXTRA_VARS_FILE" \
                -v
              
              # ====== Step 8: Post-Deployment Validation ======
              echo "✅ Step 8: Validating deployment..."
              
              # Wait for backend health check
              HEALTH_CHECK_RETRIES=10
              HEALTH_CHECK_DELAY=3
              HEALTH_COUNT=0
              
              while [ $HEALTH_COUNT -lt $HEALTH_CHECK_RETRIES ]; do
                if curl -f -s http://"${BACKEND_PUBLIC_IP}":3000/health/live >/dev/null 2>&1; then
                  echo "✓ Backend health check passed"
                  break
                fi
                HEALTH_COUNT=$((HEALTH_COUNT + 1))
                echo "⏳ Health check retry ${HEALTH_COUNT}/${HEALTH_CHECK_RETRIES}... (waiting ${HEALTH_CHECK_DELAY}s)"
                sleep ${HEALTH_CHECK_DELAY}
              done
              
              if [ $HEALTH_COUNT -eq $HEALTH_CHECK_RETRIES ]; then
                echo "⚠️  Backend health check timeout (may still be starting)"
              else
                echo "✓ Backend API responding on http://${BACKEND_PUBLIC_IP}:3000"
              fi
              
              # Verify Valkey
              if ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=accept-new -o UserKnownHostsFile="$KNOWN_HOSTS_FILE" \
                  -i "${SSH_KEY_PATH}" ubuntu@"${BACKEND_PUBLIC_IP}" \
                  "docker exec valkey redis-cli ping" >/dev/null 2>&1; then
                echo "✓ Valkey cache verified"
              fi
              
              # Display summary
              echo ""
              echo "╔════════════════════════════════════════╗"
              echo "║ ✅ Backend Deployment Complete        ║"
              echo "╠════════════════════════════════════════╣"
              echo "║ API URL: http://${BACKEND_PUBLIC_IP}:3000"
              echo "║ Instance: ${BACKEND_INSTANCE_ID}"
              echo "║ Database: ${RDS_ENDPOINT}"
              echo "║ Cache: redis://localhost:6379         ║"
              echo "╚════════════════════════════════════════╝"
              echo ""
              echo "📝 Next steps:"
              echo "  1. Verify health: curl http://${BACKEND_PUBLIC_IP}:3000/health/live"
              echo "  2. View logs: ssh -i ${SSH_KEY_PATH} ubuntu@${BACKEND_PUBLIC_IP}"
              echo "  3. Run migrations: docker exec dittopedia-backend npx prisma migrate deploy"
              
              docker logout || true
            '''
          }
        }
      }
      post {
        failure {
          echo "❌ AWS deployment failed. Check logs above for details."
        }
      }
    }
  }

  post {
    always {
      // Clean up sensitive files
      sh 'rm -f .ssh_ingress_cidr 2>/dev/null || true'
      sh 'docker logout 2>/dev/null || true'
    }
    failure {
      echo "❌ Pipeline failed. Review logs above for details."
      echo "📝 Common issues:"
      echo "  - Bun not found: Ensure Bun is installed on agent at /usr/local/bin/bun"
      echo "  - Docker build failed: Check Dockerfile and dependencies"
      echo "  - AWS deployment: Verify all 5 credentials are configured"
      echo "  - SSH connectivity timeout: Check security group rules and EC2 instance status"
    }
    success {
      echo "✅ Pipeline completed successfully"
      script {
        def branchName = env.BRANCH_NAME ?: ''
        def gitBranch = env.GIT_BRANCH ?: ''
        if (branchName == 'staging-aws-1' || gitBranch == 'staging-aws-1' || gitBranch == 'origin/staging-aws-1' || gitBranch == 'refs/remotes/origin/staging-aws-1' || gitBranch.endsWith('/staging-aws-1')) {
          echo "🚀 Backend deployed to staging. Check AWS console for EC2 instances."
        }
      }
    }
  }
}
