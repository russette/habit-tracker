const habitInput = document.getElementById("habitInput");
const addHabitButton = document.getElementById("addHabitButton");
const habitList = document.getElementById("habitList");
const emptyMessage = document.getElementById("emptyMessage");

const completedCount = document.getElementById("completedCount");
const progressPercent = document.getElementById("progressPercent");
const streakCount = document.getElementById("streakCount");
const resetButton = document.getElementById("resetButton");

let habits = JSON.parse(localStorage.getItem("russetteHabits")) || [];

function getToday() {
    const date = new Date();

    return date.getFullYear() + "-" +
        String(date.getMonth() + 1).padStart(2, "0") + "-" +
        String(date.getDate()).padStart(2, "0");
}

function saveHabits() {
    localStorage.setItem("russetteHabits", JSON.stringify(habits));
}

function updateStats() {
    const total = habits.length;

    const completed = habits.filter(function(habit) {
        return habit.completedToday;
    }).length;

    completedCount.textContent = completed;

    if (total === 0) {
        progressPercent.textContent = "0%";
    } else {
        const progress = Math.round((completed / total) * 100);
        progressPercent.textContent = progress + "%";
    }

    let streak = 0;

    if (total > 0) {
        const allCompleted = habits.every(function(habit) {
            return habit.completedToday;
        });

        if (allCompleted) {
            streak = Math.max(
                ...habits.map(function(habit) {
                    return habit.streak || 0;
                })
            );

            if (streak === 0) {
                streak = 1;
            }
        }
    }

    streakCount.textContent = streak;
}

function renderHabits() {
    habitList.innerHTML = "";

    if (habits.length === 0) {
        emptyMessage.style.display = "block";
    } else {
        emptyMessage.style.display = "none";
    }

    habits.forEach(function(habit) {

        const habitElement = document.createElement("div");
        habitElement.className = "habit";

        if (habit.completedToday) {
            habitElement.classList.add("completed");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "habit-check";
        checkbox.checked = habit.completedToday;

        checkbox.addEventListener("change", function() {

            const today = getToday();

            if (checkbox.checked) {
                habit.completedToday = true;

                if (habit.lastCompleted !== today) {
                    habit.streak = (habit.streak || 0) + 1;
                    habit.lastCompleted = today;
                }

            } else {
                habit.completedToday = false;
            }

            saveHabits();
            renderHabits();
            updateStats();
        });

        const name = document.createElement("span");
        name.className = "habit-name";
        name.textContent = habit.name;

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-habit";
        deleteButton.textContent = "🗑️";

        deleteButton.addEventListener("click", function() {

            habits = habits.filter(function(item) {
                return item.id !== habit.id;
            });

            saveHabits();
            renderHabits();
            updateStats();
        });

        habitElement.appendChild(checkbox);
        habitElement.appendChild(name);
        habitElement.appendChild(deleteButton);

        habitList.appendChild(habitElement);
    });

    updateStats();
}

function addHabit() {

    const name = habitInput.value.trim();

    if (name === "") {
        return;
    }

    const newHabit = {
        id: Date.now(),
        name: name,
        completedToday: false,
        streak: 0,
        lastCompleted: null
    };

    habits.push(newHabit);

    saveHabits();
    renderHabits();

    habitInput.value = "";
    habitInput.focus();
}

addHabitButton.addEventListener("click", addHabit);

habitInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
        addHabit();
    }
});

resetButton.addEventListener("click", function() {

    habits.forEach(function(habit) {
        habit.completedToday = false;
    });

    saveHabits();
    renderHabits();
});

function resetForNewDay() {

    const today = getToday();

    habits.forEach(function(habit) {

        if (habit.lastCheckedDate !== today) {
            habit.completedToday = false;
            habit.lastCheckedDate = today;
        }

    });

    saveHabits();
}

resetForNewDay();
renderHabits();
