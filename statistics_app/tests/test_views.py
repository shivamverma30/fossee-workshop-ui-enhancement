from datetime import timedelta

from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone

from teams.models import Team
from workshop_app.models import Profile, Workshop, WorkshopType


class StatisticsViewsTest(TestCase):
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

    def create_workshop(self):
        coordinator, _ = self.create_user_with_profile("coordinator_one", "coordinator")
        instructor, _ = self.create_user_with_profile("instructor_one", "instructor")
        workshop_type = WorkshopType.objects.create(
            name="Python Basics",
            description="Introductory workshop",
            duration=1,
            terms_and_conditions="Standard workshop terms"
        )
        return Workshop.objects.create(
            coordinator=coordinator,
            instructor=instructor,
            workshop_type=workshop_type,
            date=timezone.now().date() + timedelta(days=2),
            status=1,
            tnc_accepted=True,
        )

    def test_public_statistics_page_renders_for_anonymous_users(self):
        self.create_workshop()
        response = self.client.get(reverse("statistics_app:public"))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "statistics_app/workshop_public_stats.html")

    def test_public_statistics_filter_by_date_returns_success(self):
        self.create_workshop()
        from_date = timezone.now().date().isoformat()
        to_date = (timezone.now().date() + timedelta(days=30)).isoformat()

        response = self.client.get(reverse("statistics_app:public"), {
            "from_date": from_date,
            "to_date": to_date,
            "sort": "date",
        })

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Workshop Results")

    def test_team_statistics_requires_login(self):
        response = self.client.get(reverse("statistics_app:team"))
        self.assertEqual(response.status_code, 302)

    def test_team_statistics_redirects_when_no_teams_exist(self):
        user, _ = self.create_user_with_profile("instructor_no_team", "instructor")
        self.client.login(username=user.username, password="pass@12345")

        response = self.client.get(reverse("statistics_app:team"))

        self.assertEqual(response.status_code, 302)

    def test_team_statistics_redirects_non_member(self):
        creator, creator_profile = self.create_user_with_profile("team_creator", "instructor")
        outsider, _ = self.create_user_with_profile("team_outsider", "instructor")
        team = Team.objects.create(creator=creator)
        team.members.add(creator_profile)

        self.client.login(username=outsider.username, password="pass@12345")
        response = self.client.get(reverse("statistics_app:team", args=[team.id]))

        self.assertEqual(response.status_code, 302)

    def test_team_statistics_renders_for_member(self):
        creator, creator_profile = self.create_user_with_profile("team_member", "instructor")
        team = Team.objects.create(creator=creator)
        team.members.add(creator_profile)

        self.client.login(username=creator.username, password="pass@12345")
        response = self.client.get(reverse("statistics_app:team", args=[team.id]))

        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "statistics_app/team_stats.html")
