import React, { useState, useEffect } from "react";
import "rc-slider/assets/index.css";
import "./styles.css";
import _ from "lodash";
import randomColor from "randomcolor";
import bg from "./bg.png";
import Slider from "rc-slider";

console.log(bg);

export default function App() {
  const [cols, setCols] = useState(6);
  const [rows, setRows] = useState(6);

  const [gameState, setGameState] = useState([]);

  const init = () => {
    const colors = _.shuffle(
      randomColor({
        count: (rows * cols) / 2
      })
    );

    const positions = _.shuffle(
      _.flatten(_.range(cols).map(col => _.range(rows).map(row => [col, row])))
    );

    const state = _.range((rows * cols) / 2).map(index => {
      return {
        from: [...positions[index * 2], 0],
        to: [...positions[index * 2 + 1], 0],
        color: colors[index],
        order: index
      };
    });

    setGameState(state);
  };

  useEffect(init, [cols, rows]);

  const [selected, setSelected] = useState({
    type: null,
    index: -1,
    pos: [-1, -1, 0]
  });

  const select = ({ index, type, pos }) => () => {
    if (selected.index === -1 || !selected.type) {
      setSelected({ index, type, pos: [...pos] });
      if (index === -1 || !type) {
        setSelected({
          type: null,
          index: -1,
          pos: [-1, -1, 0]
        });
      }
    } else {
      const newGameState = [...gameState];
      const oType = selected.type === "from" ? "to" : "from";
      if (
        newGameState[selected.index][oType][0] !== pos[0] ||
        newGameState[selected.index][oType][1] !== pos[1]
      ) {
        newGameState[selected.index] = {
          ...newGameState[selected.index],
          order: _.max(gameState.map(color => color.order)) + 1,
          [selected.type]: [pos[0], pos[1], pos[2] + 1]
        };
        setGameState(_.sortBy(newGameState, color => color.order));
      }
      setSelected({
        type: null,
        index: -1,
        pos: [-1, -1, 0]
      });
    }
  };

  const orderedNodes = _.chain(gameState)
    .map((color, index) => [
      {
        type: "from",
        index,
        color: color.color,
        pos: color.from
      },
      {
        type: "to",
        index,
        color: color.color,
        pos: color.to
      }
    ])
    .flatten()
    .sortBy(node => node.pos[2])
    .value();

  return (
    <div
      className="App"
      style={{
        paddingTop: "50px",
        paddingBottom: "50px",
        margin: 0,
        background: `url(${bg})`,
        minHeight: "100vh",
        backgroundSize: "cover"
      }}
    >
      <p
        style={{
          marginBottom: "20px",
          width: 300,
          margin: "20px auto"
        }}
      >
        <Slider
          dots
          step={1}
          value={rows}
          min={2}
          max={20}
          onChange={setRows}
        />
      </p>
      <p
        style={{
          marginBottom: "20px",
          width: 300,
          margin: "30px auto 40px"
        }}
      >
        <Slider
          dots
          step={1}
          value={cols}
          min={2}
          max={20}
          onChange={setCols}
        />
      </p>
      <p>
        <span
          onClick={init}
          style={{
            padding: 5,
            color: "black",
            fontSize: "20px",
            textTransform: "uppercase",
            fontWeight: "bold",
            background: "white",
            cursor: "pointer",
            userSelect: "none"
          }}
        >
          Reset
        </span>
      </p>
      <div
        style={{
          width: cols * 60 - 30,
          height: rows * 60 - 30,
          position: "relative",
          margin: "auto",
          marginTop: 50
        }}
      >
        {_.range(rows).map(row =>
          _.range(cols).map(col => (
            <div
              onClick={select({ index: -1, pos: [col, row, 0] })}
              style={{
                borderRadius: 30,
                background: "#ddd",
                width: 30,
                height: 30,
                position: "absolute",
                left: col * 60,
                top: row * 60,
                transform: `scale(1.25)`
              }}
            />
          ))
        )}
        <svg
          style={{
            width: cols * 60 - 30,
            height: rows * 60 - 30,
            position: "absolute",
            top: 0,
            left: 0,
            pointerEvents: "none"
          }}
        >
          {gameState.map(({ color, from, to }, index) => (
            <line
              x1={from[0] * 60 + 15}
              y1={from[1] * 60 + 15}
              x2={to[0] * 60 + 15}
              y2={to[1] * 60 + 15}
              stroke={color}
              stroke-width={10}
            />
          ))}
        </svg>
        {orderedNodes.map(({ index, color, pos, type }) =>
          !pos ? null : (
            <div
              key={color + type}
              onClick={select({ index, type, pos })}
              style={{
                borderRadius: 30,
                background: color,
                width: 30,
                height: 30,
                position: "absolute",
                left: pos[0] * 60,
                top: pos[1] * 60,
                transform: `scale(${
                  selected.pos[0] === pos[0] && selected.pos[1] === pos[1]
                    ? 1.7
                    : 1
                })`
              }}
            />
          )
        )}
      </div>
    </div>
  );
}
