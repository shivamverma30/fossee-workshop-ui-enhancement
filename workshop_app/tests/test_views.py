from django.contrib.auth.models import Group, User
from django.test import TestCase
from django.urls import reverse

from workshop_app.models import Profile, WorkshopType


class WorkshopViewsTest(TestCase):
    def create_user_with_profile(self, username, position):
        user = User.objects.create_user(
            username=username,
            email=f"{username}@example.com",
            password="pass@12345"
        )
        Profile.objects.create(
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
        return user

    def test_login_page_renders(self):
        response = self.client.get(reverse("workshop_app:login"))
        self.assertEqual(response.status_code, 200)

    def test_register_page_renders(self):
        response = self.client.get(reverse("workshop_app:register"))
        self.assertEqual(response.status_code, 200)

    def test_workshop_type_list_renders_for_anonymous(self):
        WorkshopType.objects.create(
            name="Python Basics",
            description="Intro workshop",
            duration=1,
            terms_and_conditions="Standard terms"
        )
        response = self.client.get(reverse("workshop_app:workshop_type_list"))
        self.assertEqual(response.status_code, 200)

    def test_propose_workshop_requires_login(self):
        response = self.client.get(reverse("workshop_app:propose_workshop"))
        self.assertEqual(response.status_code, 302)

    def test_coordinator_status_requires_login(self):
        response = self.client.get(reverse("workshop_app:workshop_status_coordinator"))
        self.assertEqual(response.status_code, 302)

    def test_instructor_status_requires_login(self):
        response = self.client.get(reverse("workshop_app:workshop_status_instructor"))
        self.assertEqual(response.status_code, 302)

    def test_instructor_can_open_dashboard(self):
        instructor = self.create_user_with_profile("instructor_one", "instructor")
        instructor_group = Group.objects.create(name="instructor")
        instructor_group.user_set.add(instructor)

        self.client.login(username="instructor_one", password="pass@12345")
        response = self.client.get(reverse("workshop_app:workshop_status_instructor"))

        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "workshop_app/workshop_status_instructor.html")

    def test_coordinator_can_open_status_page(self):
        coordinator = self.create_user_with_profile("coordinator_one", "coordinator")

        self.client.login(username=coordinator.username, password="pass@12345")
        response = self.client.get(reverse("workshop_app:workshop_status_coordinator"))

        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "workshop_app/workshop_status_coordinator.html")

    def test_view_own_profile_requires_login(self):
        response = self.client.get(reverse("workshop_app:view_own_profile"))
        self.assertEqual(response.status_code, 302)
