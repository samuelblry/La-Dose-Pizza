FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Migrations puis création du compte super admin s'il n'existe pas encore
CMD ["sh", "-c", "python manage.py migrate && python manage.py shell -c \"from users.models import UserAccount; UserAccount.objects.filter(email='admin@ladose.fr').exists() or UserAccount.objects.create_superuser('admin@ladose.fr', 'MotDePasse123!')\" && python manage.py runserver 0.0.0.0:8000"]
