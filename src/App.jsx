import { useEffect } from "react";
import { useRef } from "react";
import { useState } from "react";

function Todo() {
  const [tasks, setTasks] = useState([]);
  const [remainingTasks, setRemainingTasks] = useState(0);
  const addTaskInput = useRef();

  useEffect(() => {
    setRemainingTasks(
      tasks.filter((taskItem) => taskItem.status === false).length
    );
  }, [tasks]);

  async function getAllTasks() {
    fetch("http://192.168.0.106:8080/api/todo/")
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setTasks(data);
      });
  }

  useEffect(() => {
    getAllTasks();
  }, []);

  async function addTask() {
    const newTask = addTaskInput.current.value;
    await fetch("http://192.168.0.106:8080/api/todo/", {
      method: "POST",
      body: JSON.stringify({ title: newTask, status: false }),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          getAllTasks();
        }
      });
  }

  function handleKey({ keyCode, target }) {
    if (keyCode === 13) {
      addTask();
    } else {
      if (!tasks.some((task) => task.title === target.value)) {
        addTaskInput.current.classList.remove("invalid");
      } else {
        addTaskInput.current.classList.add("invalid");
      }
    }
  }

  return (
    <div className="main">
      <div className="todo">
        <div className="todo-header">
          <h1>Todo List</h1>
          <small>
            {tasks.length > 0 && remainingTasks === 0 ? (
              "All done! =D"
            ) : (
              <>
                You have <b>{remainingTasks}</b> of <b>{tasks.length}</b> tasks
                remaining
              </>
            )}
          </small>
        </div>
        <div className="todo-form">
          <input
            ref={addTaskInput}
            type="text"
            placeholder="Add task..."
            onKeyUp={handleKey}
          />
          <button onClick={addTask}>+</button>
        </div>
        <div className="todo-body">
          <List tasks={tasks} setTasks={setTasks} />
        </div>
      </div>
    </div>
  );
}

const List = ({ tasks, setTasks }) => {
  if (tasks.length > 0) {
    return (
      <ul className="todo-list">
        {tasks.map((task, taskIndex) => {
          return (
            <Task
              key={taskIndex}
              taskId={taskIndex}
              task={task}
              setTasks={setTasks}
            />
          );
        })}
      </ul>
    );
  }
  return (
    <div className="empty">
      <p>
        <svg viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
          <g
            fill="none"
            fillRule="evenodd"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="translate(2.5 4.5)"
          >
            <path d="m3.65939616 0h8.68120764c.4000282 0 .7615663.23839685.9191451.6060807l2.7402511 6.3939193v4c0 1.1045695-.8954305 2-2 2h-12c-1.1045695 0-2-.8954305-2-2v-4l2.74025113-6.3939193c.15757879-.36768385.51911692-.6060807.91914503-.6060807z" />
            <path d="m0 7h4c.55228475 0 1 .44771525 1 1v1c0 .55228475.44771525 1 1 1h4c.5522847 0 1-.44771525 1-1v-1c0-.55228475.4477153-1 1-1h4" />
          </g>
        </svg>
      </p>
      <p>
        <b>Empty list</b>
      </p>
      <p>Add a new task above</p>
    </div>
  );
};

const Task = ({ taskId, task, setTasks }) => {
  async function removeTask(id) {
    await fetch(`http://192.168.0.106:8080/api/todo/${id}/`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then(() => {
        setTasks((tasks) => {
          const result = tasks.filter(
            (taskItem, taskIndex) => taskIndex !== taskId
          );
          console.log(result);
          return result;
        });
      });
  }

  async function toggleTask(id) {
    const doneStatus = !task.status;
    await fetch(`http://192.168.0.106:8080/api/todo/${id}/`, {
      method: "PATCH",
      body: JSON.stringify({ status: doneStatus }),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setTasks((tasks) => {
            return tasks.map((taskItem, taskIndex) => {
              if (taskIndex === taskId) {
                return {
                  ...taskItem,
                  status: doneStatus,
                };
              }
              return taskItem;
            });
          });
        }
      });
  }

  const prefixClass = "task-item";
  const doneClass = task.status ? " done" : "";

  return (
    <li className={prefixClass + doneClass}>
      <div className={prefixClass + "-infos"}>
        <label className={prefixClass + "-checkbox"}>
          <input
            type="checkbox"
            onChange={() => toggleTask(task.id)}
            checked={task.status}
          />
          <div className={prefixClass + "-checkbox-el"}></div>
        </label>
        <div className={prefixClass + "-text"}>
          {task.title + " " + task.created_at}
        </div>
      </div>
      <div className={prefixClass + "-remove"}>
        <button onClick={() => removeTask(task.id)} title="Remover item">
          <svg
            height="21"
            viewBox="0 0 21 21"
            width="21"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g
              fill="none"
              fillRule="evenodd"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              transform="translate(5 5)"
            >
              <path d="m10.5 10.5-10-10z" />
              <path d="m10.5.5-10 10" />
            </g>
          </svg>
        </button>
      </div>
    </li>
  );
};

export default Todo;

// {
//   title: "Task 1",
//   status: true,
// },
// {
//   title: "Task 2",
//   status: true,
// },
// {
//   title: "Task 3",
//   status: false,
// },
// {
//   title: "Task 4",
//   status: false,
// },
// {
//   title: "Task 5",
//   status: false,
// }
