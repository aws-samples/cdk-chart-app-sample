import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, registerables, ChartData } from 'chart.js';
import { Chart, ChartProps } from 'react-chartjs-2';
import { DateTime } from 'luxon';
import urljoin from 'url-join';

ChartJS.register(...registerables);

type MyChartProps = {
  deviceId: string;
};

type Metric = {
  timestamp: string;
  value: number;
};

const timeFormat = "yyyy-MM-dd'T'HH:mm:ss'Z'";

const getMetrics = async (props: MyChartProps): Promise<Metric[]> => {
  const params = {
    deviceId: props.deviceId,
  };
  const query = new URLSearchParams(params);
  const res = await fetch(urljoin(process.env.REACT_APP_API_BASE_URL!, `metrics?${query}`));

  return res.json();
};

export const MyChart = (props: MyChartProps): JSX.Element => {
  const [metrics, setMetrics] = useState<Metric[]>([]);

  useEffect(() => {
    getMetrics(props)
      .then((m) => {
        setMetrics(m);
      })
      .catch((e) => {
        console.log(e);
      });
  }, [props]);

  const data: ChartData<'line', number[], string> = {
    labels: metrics.map((m) =>
      DateTime.fromFormat(m.timestamp, timeFormat, { zone: 'UTC' })
        .toLocal()
        .toLocaleString(DateTime.TIME_24_WITH_SECONDS),
    ),
    datasets: [
      {
        type: 'line',
        label: 'value',
        data: metrics.map((m) => m.value),
        borderColor: 'rgba(245, 195, 66, 0.9)',
      },
    ],
  };

  const options: ChartProps['options'] = {
    responsive: true,
  };

  return <Chart type="line" data={data} options={options} />;
};
