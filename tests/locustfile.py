from locust import HttpUser, task, between
import random

class HighTrafficBookingUser(HttpUser):
    wait_time = between(0.1, 0.5)

    @task(3)
    def view_event_seats(self):
        self.client.get("/api/events/1/seats/")

    @task(2)
    def attempt_seat_hold(self):
        # Multiple users contending for popular seat IDs
        target_seat_id = random.choice([1, 2, 3, 5, 10, 15, 20])
        payload = {
            "seat_id": target_seat_id,
            "event_id": 1
        }
        with self.client.post("/api/seats/hold/", json=payload, catch_response=True) as response:
            if response.status_code in [200, 201]:
                response.success()
            elif response.status_code == 409:
                # 409 Conflict is the expected, correct rejection when another user holds the seat!
                response.success()
            else:
                response.failure(f"Unexpected status: {response.status_code}")

    @task(1)
    def check_availability(self):
        self.client.get("/api/availability/?event_id=1")
