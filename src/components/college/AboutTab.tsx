export function AboutTab() {
  return (
    <div className="flex-1 flex flex-col gap-lg max-w-[700px]">
      <div className="bg-surface rounded-xl border border-outline-variant p-lg flex flex-col gap-md">
        <h2 className="font-headline-md text-headline-md text-on-surface">About GLA University</h2>
        <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
          GLA University is a premier educational institution dedicated to fostering innovation, academic excellence, and holistic student development. Located in the cultural heart of Mathura, Uttar Pradesh, our sprawling campus provides a vibrant and modern ecosystem for learning and growth. We are committed to nurturing a community of forward-thinking individuals, equipping them with the skills, knowledge, and ethical foundation to lead in a rapidly evolving global landscape.
        </p>
      </div>

      <div className="flex flex-col gap-md">
        <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">Campus Life & Facilities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <img
            alt="Modern Campus Building"
            className="w-full h-48 object-cover rounded-xl border border-outline-variant hover:opacity-80 transition-opacity cursor-pointer"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8ayPtkVNtwqw1hWhHi3C7nLrgowjHoBfaWbe0_noITu88gOSofihnHxySx0auoxeREwuemVZFTGtaVhcEAun6uulVxmYVhrs9scb6uas6rFaRnh0xMyp-qzYOc8cUs44Ut_KY-Aq8xlVxi2xPV45rv6T9AZ79oy98RTUQiNkuX42QuKqMisC6QH5v_Og7ndCuRZWtRvF90jBQ7gzmtNrwCKqOUuZqkASFvuYZSPXkliShqdIaLNml"
          />
          <img
            alt="Students working together"
            className="w-full h-48 object-cover rounded-xl border border-outline-variant hover:opacity-80 transition-opacity cursor-pointer"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGyjpYIli9yc4JecMJygSWiJkRkpx_FzPeA5LDUv5gKooBS6-zpaCwV70e_KJiNI-5XGXGcuMU6D9tLH1OEj25G00g-ShTlMnRdxd264IGr9Hl8aM0jGzNsVA5YyEcAwm5u2fV84z4Z62M2rwIbbOOjlW7j5H1BGnjtdO8TQseYqIY6IPxsAON0YiG2XaIIq67w1SzTDgupuXUpMqVwKCP-QRHp-qTjkX54mjLEWKhHZYxr-7bRPj9"
          />
          <img
            alt="Advanced Technology Lab"
            className="w-full h-48 object-cover rounded-xl border border-outline-variant hover:opacity-80 transition-opacity cursor-pointer"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAO7xW6IpiJO4653GOyfekuxEWe9MXyKAALfc99uV_5cpaYMR6_Dus3BdNDSASikX46c8mjkGu-ywrKpIjTXMElcciifBQ6Sg6L7ab7kwLMrW7mTdWCzPuIQXAXblXBLQaHks25fw6Ni3o-Ysxr1FocBAdcUuEHPEJBtEQ5wsqhKlFVZwXQkYdE6MmDDhWG6aGyvxC2yU8rJYU4j5yiPMIpZ8SK1xK8mnWN9qjyoVOyYvzAh-uI95O3"
          />
          <img
            alt="University Library"
            className="w-full h-48 object-cover rounded-xl border border-outline-variant hover:opacity-80 transition-opacity cursor-pointer"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJyH06pGTJFqT3BH8R3Qw2bQqDd9MymmSiiPqa1FstwrkQ9PqXNQYEUuDxJzenSbUs8M0EOCcvJFaFSSZ5aQ1lng_duMWiMuBqZtgeqgGem1SkCE2k5w3PTKaGZK7MBJEsCdryq6Bt6ffLAmhx277I42_R4YQFiym_fEb098SKUh1p3jRsUoi2mZ9VqxIhQYnGeESFxv4M90bjI4wtd6OuDh4NGZF-vVukOlOQ4-zahJWmPNUlENM7"
          />
        </div>
      </div>
    </div>
  );
}
