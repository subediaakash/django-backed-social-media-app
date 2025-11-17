from django.contrib.auth import get_user_model, password_validation
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken


User = get_user_model()


class UserProfileSerializer(serializers.ModelSerializer):
    firstName = serializers.CharField(
        source='first_name',
        required=False,
        allow_blank=True,
    )
    lastName = serializers.CharField(
        source='last_name',
        required=False,
        allow_blank=True,
    )
    profilePicture = serializers.ImageField(
        source='profile_picture',
        required=False,
        allow_null=True,
    )
    friends = serializers.PrimaryKeyRelatedField(
        many=True,
        read_only=True,
    )

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'firstName',
            'lastName',
            'bio',
            'profilePicture',
            'friends',
        ]
        read_only_fields = [
            'id',
            'email',
            'friends',
        ]
        extra_kwargs = {
            'username': {'required': False},
            'bio': {'required': False, 'allow_blank': True, 'allow_null': True},
        }


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
        style={'input_type': 'password'},
        validators=[password_validation.validate_password],
    )
    confirmPassword = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
        style={'input_type': 'password'},
    )
    firstName = serializers.CharField(
        source='first_name',
        required=False,
        allow_blank=True,
    )
    lastName = serializers.CharField(
        source='last_name',
        required=False,
        allow_blank=True,
    )
    profilePicture = serializers.ImageField(
        source='profile_picture',
        required=False,
        allow_null=True,
    )

    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'password',
            'confirmPassword',
            'firstName',
            'lastName',
            'bio',
            'profilePicture',
        ]

    def validate(self, attrs):
        confirm_password = attrs.pop('confirmPassword', None)
        password = attrs.get('password')
        if password != confirm_password:
            raise serializers.ValidationError(
                {'confirmPassword': 'Passwords do not match.'}
            )
        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class EmailLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
        style={'input_type': 'password'},
    )

    default_error_messages = {
        'invalid_credentials': 'Invalid email or password.',
        'inactive': 'This account is inactive.',
    }

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        if not email or not password:
            raise AuthenticationFailed(self.error_messages['invalid_credentials'])

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist as exc:
            raise AuthenticationFailed(self.error_messages['invalid_credentials']) from exc

        if not user.is_active:
            raise AuthenticationFailed(self.error_messages['inactive'])

        if not user.check_password(password):
            raise AuthenticationFailed(self.error_messages['invalid_credentials'])

        refresh = RefreshToken.for_user(user)
        return {
            'user': user,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
        }

