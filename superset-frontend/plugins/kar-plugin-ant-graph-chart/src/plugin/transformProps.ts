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
import { ChartProps, TimeseriesDataRecord } from '@superset-ui/core';
// import { getOriginalSeries } from '@superset-ui/chart-controls';

export default function transformProps(chartProps: ChartProps) {
  /**
   * This function is called after a successful response has been
   * received from the chart data endpoint, and is used to transform
   * the incoming data prior to being sent to the Visualization.
   *
   * The transformProps function is also quite useful to return
   * additional/modified props to your data viz component. The formData
   * can also be accessed from your SupersetPluginAntGraphChart.tsx file, but
   * doing supplying custom props here is often handy for integrating third
   * party libraries that rely on specific props.
   *
   * A description of properties in `chartProps`:
   * - `height`, `width`: the height/width of the DOM element in which
   *   the chart is located
   * - `formData`: the chart data request payload that was sent to the
   *   backend.
   * - `queriesData`: the chart data response payload that was received
   *   from the backend. Some notable properties of `queriesData`:
   *   - `data`: an array with data, each row with an object mapping
   *     the column/alias to its value. Example:
   *     `[{ col1: 'abc', metric1: 10 }, { col1: 'xyz', metric1: 20 }]`
   *   - `rowcount`: the number of rows in `data`
   *   - `query`: the query that was issued.
   *
   * Please note: the transformProps function gets cached when the
   * application loads. When making changes to the `transformProps`
   * function during development with hot reloading, changes won't
   * be seen until restarting the development server.
   */
  const { width, height, formData, queriesData } = chartProps;
  const {
    boldText,
    headerFontSize,
    headerText,
    sourceId,
    targetId,
    nodeLabel,
    edgeLabel,
    metrics,
    edgeMetric,
    color,
    nodeStrength,
    edgeStrength,
    textColor,
  } = formData;

  const rawData = (queriesData[0].data as TimeseriesDataRecord[]) || [];

  let edgeMax = Number.MIN_SAFE_INTEGER;
  const edgeMin = 0;

  let nodeMax = Number.MIN_SAFE_INTEGER;
  const nodeMin = 0;

  function createNode(rawData: any): any {
    const s = new Set();
    const mapLabel = new Map();
    const mapMetric = new Map();
    for (let i = 0; i < rawData.length; i += 1) {
      s.add(rawData[i][sourceId]);
      s.add(rawData[i][targetId]);
      if (nodeLabel !== undefined) {
        mapLabel.set(rawData[i][sourceId], rawData[i][nodeLabel]);
      } else if (nodeLabel === undefined) {
        mapLabel.set(rawData[i][sourceId], rawData[i][sourceId]);
      }

      if (metrics.length > 0) {
        if (nodeMax < rawData[i][metrics[0].label]) {
          nodeMax = rawData[i][metrics[0].label];
        }
        mapMetric.set(rawData[i][sourceId], rawData[i][metrics[0].label]);
      }
    }

    const nodes: any = [];
    // var id = 1;
    for (const item of s) {
      let subLabel = '';
      if (mapLabel.get(item) !== undefined) {
        subLabel = mapLabel.get(item);
      }
      let metricStr = 10;
      if (mapMetric.get(item) !== undefined) {
        metricStr = parseInt(mapMetric.get(item), 10);
      }

      const dummyObj = {
        id: item,
        value: {
          text: item,
          subText: subLabel,
          metric: metricStr,
        },
      };

      // id += 1;
      nodes.push(dummyObj);
    }

    return nodes;
  }

  function findIndex(nodes: any, source: any, target: any): any {
    const result = new Array(2);

    for (const node of nodes) {
      if (node.value.text === source) {
        result[0] = node;
      }
      if (node.value.text === target) {
        result[1] = node;
      }
    }

    return result;
  }

  function createEdge(rawData: any, nodes: any): any {
    const edges = new Set();

    for (let i = 0; i < rawData.length; i += 1) {
      const nds = findIndex(nodes, rawData[i][sourceId], rawData[i][targetId]);

      const dummyObj = {
        source: nds[0].id,
        target: nds[1].id,
        value: {},
      };
      const val: any = {
        metric: 1,
      };
      if (edgeLabel !== undefined) {
        val.text = rawData[i][edgeLabel];
      }

      if (edgeMetric.length > 0) {
        const v = rawData[i][edgeMetric[0].label];
        if (parseInt(v, 10) > edgeMax) {
          edgeMax = parseInt(v, 10);
        }
        val.metric = parseInt(v, 10);
      }
      dummyObj.value = val;
      edges.add(JSON.stringify(dummyObj));
    }

    return Array.from(edges, (edge: any) => JSON.parse(edge));
  }

  // console.log("set", createNode(rawData))
  // console.log("raw data ", rawData)
  const nodes: any = createNode(rawData) || [];
  const edges: any = createEdge(rawData, nodes) || [];
  const data = {
    nodes,
    edges,
  };

  return {
    color,
    textColor,
    nodeStrength,
    edgeStrength,
    nodeMax,
    nodeMin,
    edgeMax,
    edgeMin,
    width,
    height,
    data,
    // and now your control data, manipulated as needed, and passed through as props!
    boldText,
    headerFontSize,
    headerText,
  };
}
