import re
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator


# Mot de passe conforme aux recommandations ANSSI (avec limitation des tentatives) :
# 12 caractères minimum, majuscule, minuscule, chiffre et caractère spécial.
class ANSSIPasswordValidator:
    def __init__(self, min_length=12):
        self.min_length = min_length

    def validate(self, password, user=None):
        manquants = []
        if len(password) < self.min_length:
            manquants.append(f'{self.min_length} caractères minimum')
        if not re.search(r'[A-Z]', password):
            manquants.append('une majuscule')
        if not re.search(r'[a-z]', password):
            manquants.append('une minuscule')
        if not re.search(r'[0-9]', password):
            manquants.append('un chiffre')
        if not re.search(r'[^A-Za-z0-9]', password):
            manquants.append('un caractère spécial')
        if manquants:
            raise ValidationError(
                'Le mot de passe doit contenir ' + ', '.join(manquants) + '.',
                code='password_anssi',
            )

    def get_help_text(self):
        return ('12 caractères minimum avec une majuscule, une minuscule, '
                'un chiffre et un caractère spécial.')


# Téléphone : chiffres uniquement (avec + initial, espaces, points ou tirets)
validate_phone = RegexValidator(
    regex=r'^\+?[0-9][0-9 .\-]{7,18}$',
    message='Numéro de téléphone invalide.',
)

# Code postal français : exactement 5 chiffres
validate_zip_code = RegexValidator(
    regex=r'^[0-9]{5}$',
    message='Code postal invalide (5 chiffres attendus).',
)

# Prénom, nom, ville : lettres (accents inclus), espaces, tirets et apostrophes
validate_name = RegexValidator(
    regex=r"^[A-Za-zÀ-ÿ' -]{1,100}$",
    message='Ne doit contenir que des lettres.',
)

# Rue : lettres, chiffres et ponctuation d'adresse
validate_street = RegexValidator(
    regex=r"^[0-9A-Za-zÀ-ÿ' ,.\-]{1,255}$",
    message='Adresse invalide.',
)
