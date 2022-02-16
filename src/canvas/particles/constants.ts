export const PARTICLE_MAX_LIFETIME = 3;
export function createConfig(x: number, y: number, width: number) {
  return {
    lifetime: {
      min: 0.1,
      max: PARTICLE_MAX_LIFETIME,
    },
    frequency: 0.05,
    maxParticles: 50,
    behaviors: [
      {
        type: "alpha",
        config: {
          alpha: {
            list: [
              {
                time: 0,
                value: 0,
              },
              {
                time: 0.1,
                value: 1,
              },
              {
                time: 1,
                value: 0.75,
              },
              {
                time: 2,
                value: 0.2,
              },
            ],
          },
        },
      },
      {
        type: "moveAcceleration",
        config: {
          accel: {
            x: 0,
            y: -50,
          },
          minStart: 10,
          maxStart: 50,
        },
      },
      {
        type: "scale",
        config: {
          scale: {
            list: [
              {
                time: 0,
                value: 0,
              },
              {
                time: 0.1,
                value: 0.7,
              },
              {
                time: 0.5,
                value: 0.3,
              },
              {
                time: 1.5,
                value: 0.1,
              },
              {
                time: 2.5,
                value: 0.02,
              },
            ],
          },
          minMult: 0.001,
        },
      },
      {
        type: 'blendMode',
        config: {
            blendMode: 'screen',
        }
    },    
      {
        type: "colorStatic",
        config: {
          color: "9ff3ff"
        },
      },
      {
        type: "rotation",
        config: {
          minSpeed: 10,
          maxSpeed: 10,
          minStart: 225,
          maxStart: 315,
        },
      },
      {
        type: "textureRandom",
        config: {
          textures: ["/particle.png"],
        },
      },
      {
        type: "spawnShape",
        config: {
          type: "rect",
          data: {
            x: 0,
            y: 0,
            w: width,
            h: 5,
          },
        },
      },
    ],
    pos: { x, y },
  };
}
