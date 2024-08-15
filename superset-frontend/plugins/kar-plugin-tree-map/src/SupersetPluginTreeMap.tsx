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
import { createRef } from 'react';
import { styled } from '@superset-ui/core';
import { Graphviz } from 'graphviz-react';
import {
  SupersetPluginTreeMapProps,
  SupersetPluginTreeMapStylesProps,
} from './types';

// The following Styles component is a <div> element, which has been styled using Emotion
// For docs, visit https://emotion.sh/docs/styled

// Theming variables are provided for your use via a ThemeProvider
// imported from @superset-ui/core. For variables available, please visit
// https://github.com/apache-superset/superset-ui/blob/master/packages/superset-ui-core/src/style/index.ts

const Styles = styled.div<SupersetPluginTreeMapStylesProps>``;

/**
 * ******************* WHAT YOU CAN BUILD HERE *******************
 *  In essence, a chart is given a few key ingredients to work with:
 *  * Data: provided via `props.data`
 *  * A DOM element
 *  * FormData (your controls!) provided as props by transformProps.ts
 */

export default function SupersetPluginTreeMap(
  props: SupersetPluginTreeMapProps,
) {
  const { data, height, width } = props;
  // console.log('data', data);
  const rootElem = createRef<HTMLDivElement>();

  // const fillColorArray = ['#ffe0e0', '#ffb8b8', '#ff8f88', '#ff6666', '#ff3d3d', '#ff1414','#eb0000', '#bf2c2c', '#8d2121',, '#7c1d1d', '#c20000','#990000','#700000', '#4700000','#0a0000'];
  const fillColorArray = [
    '#fde9e9',
    '#fad2d2',
    '#f8bcbc',
    '#f6a5a5',
    '#f48f8f',
    '#f17878',
    '#ef6262',
    '#ed4b4b',
    '#ea3434',
    '#e81e1e',
    '#d11b1b',
    '#ba1818',
    '#a21515',
    '#8b1212',
    '#740f0f',
    '#5d0c0c',
    '#460909',
    '#2e0606',
    '#170303',
    '#000000',
  ];
  const sourceArray: any = [];
  let uniqueValues: any = [];

  const generateData = () => {
    let newData = '';
    newData +=
      'node [style=filled, color=cornflowerblue, fontcolor=white, fontsize=10, fontname="Helvetica"]';
    newData += 'edge [arrowhead=normal]';
    newData +=
      'Start [dir=none,fillcolor="#ffffff",fontcolor="#3A8400",color="#3A8400",penwidth=2.0,shape="circle",arrowsize=2, penwidth=2.0]';
    newData +=
      'End [fillcolor="#ffffff",fontcolor="#861A1A",color="#861A1A",penwidth=2.0, shape="circle",arrowsize=2, penwidth=2.0]';
    newData += 'node [fontcolor="#ffffff"];\n';

    data.forEach((d, index) => {
      sourceArray.push(d.source);
      sourceArray.push(d.target);
    });
    uniqueValues = [...new Set(sourceArray)];
    uniqueValues.sort();

    // node and average seconds
    const secondsAndNode: any = [];
    uniqueValues.forEach((d: any, index: number) => {
      const filtered = data.filter(da => da.source === d);
      const sum = filtered
        .map(obj => obj.measure_one)
        .reduce((a: any, b: any) => a + b, 0);
      const seconds = Math.round(sum / filtered.length);
      if (d.toLowerCase() !== 'start' && d.toLowerCase() !== 'end')
        secondsAndNode.push({ node: d, seconds });
    });

    // find uniqueseonds
    const allSeconds = secondsAndNode.map((obj: any) => obj.seconds);
    const uniqueSeconds = [...new Set(allSeconds)].sort();
    const colors: any = [];
    fillColorArray.forEach((d: any, i: number) => {
      if (i % uniqueSeconds.length === 0) {
        colors.push(d);
      }
    });
    colors.length = uniqueSeconds.length;
    const uniqueSecondsColor = uniqueSeconds.map(
      // eslint-disable-next-line no-new-object
      (obj, index) => new Object({ seconds: obj, color: colors[index] }),
    );

    // console.log('uniqueSecondsColor', uniqueSecondsColor);
    uniqueValues.forEach((d: any, index: number) => {
      const filtered = data.filter(da => da.source === d);
      const sum = filtered
        .map(obj => obj.measure_one)
        .reduce((a: any, b: any) => a + b, 0);
      const seconds = Math.round(sum / filtered.length);
      let fontColor = '#ffffff';

      // Check if the last color in the colors array is in the fillColorArray
      if (fillColorArray.indexOf(colors[colors.length - 1]) > 8) {
        fontColor = '#ffffff';
      }

      const filteredNode: any = uniqueSecondsColor.filter(
        (obj: any) => obj.seconds === seconds,
      );

      // Add node properties to newData
      if (d.toLowerCase() !== 'start' && d.toLowerCase() !== 'end') {
        newData += `${d} [label="${d}\\n ${seconds} Secs\\n (${
          filtered.length
        })",weight="1",fillcolor="${
          filteredNode.length > 0 ? filteredNode[0].color : '#dfdfdf'
        }",color=grey,fontcolor="${fontColor}",penwidth=3.0,shape="box",style="rounded,filled",penwidth=1.0,shape="box",style="rounded,filled", arrowsize=0.5];\n`;
      }
    });
    const dotData = data.map(item => `"${item.source}" -> "${item.target}"`);
    console.log('rrr', newData);
    // Set the font color for "Start" node
    // Set properties for the entire graph
    const graphProperties =
      'node [style=filled, color=black, fontcolor=white, fontsize=10, fontname="Helvetica"];\n' +
      'edge [arrowhead=normal];\n'; // Set the background color of the graph

    // Set the font color for "Start" node
    const startNodeProperties =
      'Start [dir=none,fillcolor="#ffffff",fontcolor="#3A8400",color="#3A8400",penwidth=2.0,shape="rounded,filled",arrowsize=0.5,penwidth=3.0]';

    // Set the font color for "End" node
    const endNodeProperties =
      'End [fillcolor="#ffffff",fontcolor="#861A1A",color="#861A1A",penwidth=2.0,shape="rounded,filled",arrowsize=0.5,penwidth=3.0]';

    // Join the DOT data into a single string
    const dotString = `digraph G {
      ${graphProperties}
${dotData.join('\n')}
${startNodeProperties}
${endNodeProperties}
}`;
    // console.log('newData', newData);
    return dotString;
  };
  const newData = generateData();

  return (
    <Styles
      ref={rootElem}
      boldText={props.boldText}
      headerFontSize={props.headerFontSize}
      height={height}
      width={width}
    >
      <Graphviz
        dot={newData}
        options={{
          fit: true,
          height,
          width: width + 100,
          zoom: true,
        }}
      />
    </Styles>
  );
}
