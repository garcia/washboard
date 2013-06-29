from django.core.urlresolvers import reverse
from django.test import TestCase

class TestRegistration(TestCase):
    def test_welcome(self):
        response = self.client.get('/')
        self.assertIn('environment', response.context)

class SimpleTest(TestCase):
    def test_basic_addition(self):
        """
        Tests that 1 + 1 always equals 2.
        """
        self.assertEqual(1 + 1, 2)
