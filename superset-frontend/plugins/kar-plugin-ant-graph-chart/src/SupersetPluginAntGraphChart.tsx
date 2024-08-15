/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
/* eslint-disable theme-colors/no-literal-colors */
import { useEffect, useState } from 'react';
// @ts-ignore
import { FundFlowGraph } from '@ant-design/graphs'; // FundFlowGraphConfig

// The following Styles component is a <div> element, which has been styled using Emotion
// For docs, visit https://emotion.sh/docs/styled

// Theming variables are provided for your use via a ThemeProvider
// imported from @superset-ui/core. For variables available, please visit
// https://github.com/apache-superset/superset-ui/blob/master/packages/superset-ui-core/src/style/index.ts

/**
 * ******************* WHAT YOU CAN BUILD HERE *******************
 *  In essence, a chart is given a few key ingredients to work with:
 *  * Data: provided via `props.data`
 *  * A DOM element
 *  * FormData (your controls!) provided as props by transformProps.ts
 */

export default function SupersetPluginAntGraphChart(props: any) {
  // SupersetPluginAntGraphChartProps
  // height and width are the height and width of the DOM element as it exists in the dashboard.
  // There is also a `data` prop, which is, of course, your DATA 🎉
  // const { data, height, width } = props;

  const [key, setKey] = useState(
    props.height.toString() + props.width.toString(),
  );
  // Often, you just want to access the DOM and do whatever you want.
  // Here, you can do that with createRef, and the useEffect hook.
  useEffect(() => {
    setKey(props.height.toString() + props.width.toString());
  });

  const { data } = props;
  const nodeBack = props.color;
  const text = props.textColor;
  let { edgeMax } = props;
  const { edgeMin } = props;

  let { nodeMax } = props;
  const { nodeMin } = props;
  const node_strength = props.nodeStrength;
  const edge_strength = props.edgeStrength;

  // console.log(text);

  const config: any = {
    data,
    height: props.height,
    nodeCfg: {
      type: 'fund-card',
      label: {
        style: (node: any) => {
          let t = node.value.subText;
          if (node.value.subText === '') {
            t = node.value.text;
          }
          const maxWidth = 15; // Define the maximum width for text
          const textLength = t.length;
          if (textLength > maxWidth) {
            const wrappedText = t
              .match(new RegExp(`.{1,${maxWidth}}`, 'g'))
              .join('\n');
            return {
              text: wrappedText,
              fill: `rgba(${text.r}, ${text.g}, ${text.b}, ${text.a})`,
            };
          }

          if (node.id === 'start') {
            return {
              fill: 'green',
            };
          }
          if (node.id === 'end') {
            return {
              fill: 'red',
            };
          }
          return {
            text: `${t}`,
            fill: `rgba(${node.value.text.r}, ${node.value.text.g}, ${node.value.text.b}, ${node.value.text.a})`,
            // textAlign: 'center', // Center-align the text
          };
        },
      },
      style: (node: any) => {
        let opacity = nodeBack.a;
        nodeMax += 0.1;
        const newMin = 0.1;
        const newMax = 1;
        if (node.value.metric !== undefined && node_strength) {
          opacity = (node.value.metric - nodeMin) / (nodeMax - nodeMin);
          opacity = opacity * (newMax - newMin) + newMin;
          // opacity = opacity/2;
        }
        // console.log(node.value.metric, " ", nodeMax )
        // console.log("opacity value" ,opacity)

        if (node.id === 'start') {
          return {
            stroke: 'green',
            lineWidth: 5,
          };
        }
        if (node.id === 'end') {
          return {
            stroke: 'red',
            lineWidth: 5,
          };
        }
        const textLength = node.value.text.length;
        const maxWidth = 20; // Define the maximum width for text
        const wrappedText = node.value.text
          .match(new RegExp(`.{1,${maxWidth}}`, 'g'))
          .join('\n');
        const numLines = wrappedText.split('\n').length;
        const minWidth = 100; // Minimum width for the node
        const minHeight = 70; // Fixed height for the node
        const width = Math.max(minWidth, textLength * 10); // Adjust the multiplier as per your preference
        const height = Math.max(minHeight, numLines * 35);
        // console.log(width, " 0" , height)
        return {
          fill: `rgba(${nodeBack.r}, ${nodeBack.g}, ${nodeBack.b}, ${opacity})`,
          lineWidth: 2,
          textAlign: 'center', // Center-align the text
          size: [width, height],
        };
      },

      // size: [150, 70],
    },

    edgeCfg: {
      style: (edge: any) => {
        let val = 1;
        edgeMax += 0.1;
        const newMin = 0.5;
        const newMax = 5;
        if (edge.value.metric !== undefined && edge_strength)
          val = (edge.value.metric - edgeMin) / (edgeMax - edgeMin);
        val = val * (newMax - newMin) + newMin;

        // console.log(edge.value.metric, 'edge_metric ', val);
        return {
          lineWidth: 2 * val,
          stroke: '#1890ff',
        };
      },
      edgeStateStyles: {
        hover: {
          stroke: '#1890ff',
          lineWidth: 5,
          endArrow: {
            fill: '#1890ff',
          },
        },
      },
    },

    markerCfg: (cfg: any) => {
      const { edges } = data;
      return {
        position: 'right',
        show: edges.find((item: any) => item.source === cfg.id),
      };
    },
  };

  // console.log('Plugin props', props);

  return <FundFlowGraph key={key} {...config} />;
}
