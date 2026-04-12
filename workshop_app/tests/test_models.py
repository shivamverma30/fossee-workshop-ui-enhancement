from datetime import timedelta

from django.contrib.auth.models import User
from django.test import TestCase
from django.utils import timezone

from workshop_app.models import Profile, Workshop, WorkshopType, has_profile


class WorkshopModelsTest(TestCase):
    def create_user_with_profile(self, username, position):
        user = User.objects.create_user(
            username=username,
            email=f"{username}@example.com",
            password="pass@12345"
        )
        profile = Profile.objects.create(
            user=user,
            title="Doctor",
            institute="IIT Bombay",
            department="computer engineering",
            phone_number="9876543210",
            position=position,
            how_did_you_hear_about_us="Google",
            location="Mumbai",
            state="IN-MH",
            is_email_verified=True,
        )
        return user, profile

    def test_has_profile_helper(self):
        user = User.objects.create_user(
            username="plain_user",
            email="plain_user@example.com",
            password="pass@12345"
        )
        self.assertFalse(has_profile(user))

        _, profile = self.create_user_with_profile("profile_user", "coordinator")
        self.assertTrue(has_profile(profile.user))

    def test_workshop_type_string_representation(self):
        workshop_type = WorkshopType.objects.create(
            name="Python Basics",
            description="Intro workshop",
            duration=2,
            terms_and_conditions="Standard terms"
        )
        self.assertEqual(str(workshop_type), "Python Basics for 2 day(s)")

    def test_workshop_status_and_string_representation(self):
        coordinator, _ = self.create_user_with_profile("coordinator_one", "coordinator")
        instructor, _ = self.create_user_with_profile("instructor_one", "instructor")
        workshop_type = WorkshopType.objects.create(
            name="Numerical Methods",
            description="Workshop on numerical methods",
            duration=1,
            terms_and_conditions="Standard terms"
        )

        workshop = Workshop.objects.create(
            coordinator=coordinator,
            instructor=instructor,
            workshop_type=workshop_type,
            date=timezone.now().date() + timedelta(days=1),
            status=1,
            tnc_accepted=True,
        )

        self.assertEqual(workshop.get_status(), "Accepted")
        self.assertIn("Numerical Methods", str(workshop))
