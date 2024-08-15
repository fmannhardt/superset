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

function calculateFutureTimestamp(minutesToAdd: number) {
  const currentDate = new Date();
  const futureDate = new Date(currentDate.getTime() + minutesToAdd * 60000);

  // Convert the futureDate to a timestamp
  const futureTimestamp = futureDate.toISOString();

  return futureTimestamp;
}

function calculateRelativeData(
  dataUnit: string,
  chartUnit: string,
  number: number,
): any {
  const conversionFactors: { [key: string]: number } = {
    'hour-hour': 1,
    'hour-minute': 60,
    'hour-second': 3600,
    'minute-hour': 1 / 60,
    'minute-minute': 1,
    'minute-second': 60,
    'second-hour': 1 / 3600,
    'second-minute': 1 / 60,
    'second-second': 1,
  };

  const conversionKey = `${dataUnit}-${chartUnit}`;
  return number * conversionFactors[conversionKey] || 0;
}

function groupByTaskAndConvert(
  inputList: any,
  taskName: string,
  starttime: string,
  endtime: string,
  relativeMode: boolean,
  relativeTimeUnit: string,
  relativeChartTime: string,
): any {
  const groupedTasks: any = {};

  inputList.forEach((item: any) => {
    const taskValue = item[taskName];
    const startDate = relativeMode
      ? calculateRelativeData(
          relativeTimeUnit,
          relativeChartTime,
          item[starttime],
        )
      : calculateFutureTimestamp(item[starttime]);
    const endDate = relativeMode
      ? calculateRelativeData(
          relativeTimeUnit,
          relativeChartTime,
          item[endtime],
        )
      : calculateFutureTimestamp(item[endtime]);

    if (!groupedTasks[taskValue]) {
      groupedTasks[taskValue] = {
        key: taskValue,
        title: `Task ${taskValue}`,
        data: [],
      };
    }

    groupedTasks[taskValue].data.push({ startDate, endDate });
  });

  return Object.values(groupedTasks);
}

function sortData(data: any) {
  const sortedData = data.sort((a: any, b: any) => {
    const startDateA = a.data[0]?.startDate;
    const startDateB = b.data[0]?.startDate;

    // Handle null values
    if (startDateA === null || startDateA === undefined) {
      return 1; // Move objects with null/undefined startDate to the end
    }
    if (startDateB === null || startDateB === undefined) {
      return -1; // Move objects with null/undefined startDate to the beginning
    }

    // Use the comparison to determine the sorting order
    if (startDateA < startDateB) {
      return -1; // a should come before b
    }
    if (startDateA > startDateB) {
      return 1; // a should come after b
    }
    return 0; // a and b are equal in terms of startDate
  });

  return sortedData;
}

export default function transformProps(chartProps: ChartProps) {
  /**
   * This function is called after a successful response has been
   * received from the chart data endpoint, and is used to transform
   * the incoming data prior to being sent to the Visualization.
   *
   * The transformProps function is also quite useful to return
   * additional/modified props to your data viz component. The formData
   * can also be accessed from your PluginGanttChart.tsx file, but
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
    taskId,
    metrics,
    endMetric,
    relativeMode,
    relativeTimeUnit,
    relativeChartTime,
    relativeChartTime2,
    color,
  } = formData;

  const rawData = queriesData[0].data as TimeseriesDataRecord[];
  const masterRelativeChartTime =
    relativeTimeUnit === 'minute' ? relativeChartTime : relativeChartTime2;
  // console.log('formData via TransformProps.ts', masterRelativeChartTime);
  const taskName: string = taskId;
  const starttime: string = metrics[0].label;
  const endtime: string = endMetric[0].label;
  const unsortedData = groupByTaskAndConvert(
    rawData,
    taskName,
    starttime,
    endtime,
    relativeMode,
    relativeTimeUnit,
    masterRelativeChartTime,
  );
  const data = sortData(unsortedData);
  // console.log("sorted data", data);
  return {
    width,
    height,
    data,
    relativeMode,
    color,
  };
}
